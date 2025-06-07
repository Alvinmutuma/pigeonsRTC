// server/config/agenda.js
const Agenda = require('agenda');
const Agent = require('../models/Agent.js');
const { performUrlCheck } = require('../utils/urlChecker.js');

const mongoConnectionString = process.env.MONGODB_URI;

if (!mongoConnectionString) {
  console.error('Error: MONGODB_URI is not defined in your environment variables.');
  process.exit(1); // Exit if MongoDB URI is not set
}

const agenda = new Agenda({
  db: { address: mongoConnectionString, collection: 'agendaJobs' },
  processEvery: '10 seconds', // How often Agenda checks for new jobs
});

// Define the 'check agent api url' job
agenda.define('check agent api url', async (job) => {
  const { agentId } = job.attrs.data;
  console.log(`[Agenda] Processing API URL check for agent ${agentId}`);
  try {
    const agent = await Agent.findById(agentId);
    if (!agent) {
      console.error(`[Agenda] Agent ${agentId} not found for API URL check.`);
      return;
    }

    if (agent.integrationDetails && agent.integrationDetails.type === 'api' && agent.integrationDetails.apiUrl) {
      const result = await performUrlCheck(agent.integrationDetails.apiUrl);
      agent.automatedVettingInfo.apiUrlCheck = {
        ...result,
        lastChecked: new Date(),
      };
    } else {
      agent.automatedVettingInfo.apiUrlCheck = {
        status: 'NOT_APPLICABLE',
        lastChecked: new Date(),
        httpStatusCode: null,
        details: 'Agent is not API type or API URL is missing.',
      };
    }
    await agent.save();
    console.log(`[Agenda] API URL check for agent ${agentId} completed. Status: ${agent.automatedVettingInfo.apiUrlCheck.status}`);
  } catch (error) {
    console.error(`[Agenda] Error processing API URL check for agent ${agentId}:`, error);
    // Optionally, update agent status to ERROR here if persistent errors occur
    const agent = await Agent.findById(agentId);
    if (agent) {
        agent.automatedVettingInfo.apiUrlCheck = {
            status: 'ERROR',
            lastChecked: new Date(),
            httpStatusCode: null,
            details: `Agenda job failed: ${error.message}`,
        };
        await agent.save();
    }
  }
});

// Define the 'check agent doc url' job
agenda.define('check agent doc url', async (job) => {
  const { agentId } = job.attrs.data;
  console.log(`[Agenda] Processing Documentation URL check for agent ${agentId}`);
  try {
    const agent = await Agent.findById(agentId);
    if (!agent) {
      console.error(`[Agenda] Agent ${agentId} not found for Doc URL check.`);
      return;
    }

    if (agent.integrationDetails && agent.integrationDetails.externalDocumentationLink) {
      const result = await performUrlCheck(agent.integrationDetails.externalDocumentationLink);
      agent.automatedVettingInfo.docUrlCheck = {
        ...result,
        lastChecked: new Date(),
      };
    } else {
      agent.automatedVettingInfo.docUrlCheck = {
        status: 'NOT_APPLICABLE',
        lastChecked: new Date(),
        httpStatusCode: null,
        details: 'No documentation URL provided.',
      };
    }
    await agent.save();
    console.log(`[Agenda] Doc URL check for agent ${agentId} completed. Status: ${agent.automatedVettingInfo.docUrlCheck.status}`);
  } catch (error) {
    console.error(`[Agenda] Error processing Doc URL check for agent ${agentId}:`, error);
    const agent = await Agent.findById(agentId);
    if (agent) {
        agent.automatedVettingInfo.docUrlCheck = {
            status: 'ERROR',
            lastChecked: new Date(),
            httpStatusCode: null,
            details: `Agenda job failed: ${error.message}`,
        };
        await agent.save();
    }
  }
});

// Start Agenda and graceful shutdown
async function startAgenda() {
  try {
    await agenda.start();
    console.log('[Agenda] Started successfully.');
  } catch (error) {
    console.error('[Agenda] Failed to start:', error);
    process.exit(1); // Exit if Agenda fails to start
  }
}

async function graceful() {
  try {
    await agenda.stop();
    console.log('[Agenda] Stopped gracefully.');
    process.exit(0);
  } catch (error) {
    console.error('[Agenda] Error during graceful stop:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);

module.exports = { agenda, startAgenda };
