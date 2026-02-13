// Protocol test script - captures raw ACP messages to understand
// AskUserQuestion, ExitPlanMode, and PlanMessage protocol formats
// Run with: node test-protocol.js

const { RawDataClient, MessageType } = require('@iflow-ai/iflow-cli-sdk');
const fs = require('fs');

async function main() {
  console.log('=== Starting Protocol Capture Test ===\n');

  // Use default mode so tools can be used
  const client = new RawDataClient({
    logLevel: 'DEBUG',
    cwd: process.cwd(),
    autoStartProcess: true,
    processStartPort: 9123,
    permissionMode: 'manual',
    sessionSettings: { permission_mode: 'default' }
  });

  const allMessages = [];

  try {
    await client.connect();
    console.log('Connected to iFlow CLI\n');

    // Use a complex enough prompt that should trigger tool calls
    await client.sendMessage('请帮我在 /tmp/test-proto-output 目录创建一个简单的 hello world TypeScript 项目，包含 tsconfig.json 和 src/index.ts');

    let msgCount = 0;
    const timeout = setTimeout(() => {
      console.log('\n=== TIMEOUT: 90s elapsed, stopping ===');
      // Save captured messages before exiting
      fs.writeFileSync('protocol-capture.json', JSON.stringify(allMessages, null, 2));
      console.log('Saved captured messages to protocol-capture.json');
      process.exit(0);
    }, 90000);

    for await (const [raw, parsed] of client.receiveDualStream()) {
      msgCount++;

      const entry = {
        msgNum: msgCount,
        isControl: raw.isControl,
        messageType: raw.messageType,
        rawData: raw.rawData.substring(0, 2000),
        jsonData: raw.jsonData,
        parsed: parsed ? JSON.parse(JSON.stringify(parsed)) : null
      };
      allMessages.push(entry);

      // Print summary
      console.log(`\n#${msgCount} [${raw.messageType}]`);
      if (raw.jsonData?.method) {
        console.log('  method:', raw.jsonData.method);
      }
      if (raw.jsonData?.params?.update?.sessionUpdate) {
        console.log('  sessionUpdate:', raw.jsonData.params.update.sessionUpdate);
      }
      if (raw.jsonData?.params?.toolCall) {
        console.log('  toolCall:', JSON.stringify(raw.jsonData.params.toolCall));
      }
      if (raw.jsonData?.params?.options) {
        console.log('  options:', JSON.stringify(raw.jsonData.params.options));
      }
      if (parsed) {
        console.log('  parsed.type:', parsed.type);
        if (parsed.type === 'tool_call') {
          console.log('  toolName:', parsed.toolName);
          console.log('  status:', parsed.status);
          if (parsed.confirmation) {
            console.log('  confirmation:', JSON.stringify(parsed.confirmation));
          }
        }
        if (parsed.type === 'plan') {
          console.log('  entries:', JSON.stringify(parsed.entries));
        }
      }

      if (parsed?.type === MessageType.TASK_FINISH) {
        console.log('\nTask finished! Stop reason:', parsed.stopReason);
        clearTimeout(timeout);
        break;
      }
    }

    console.log(`\n=== Total messages captured: ${msgCount} ===`);
  } catch (error) {
    console.error('Error:', error.message || error);
  } finally {
    // Save all captured messages
    fs.writeFileSync('protocol-capture.json', JSON.stringify(allMessages, null, 2));
    console.log('Saved captured messages to protocol-capture.json');
    await client.disconnect();
    console.log('Disconnected');
  }
}

main().catch(console.error);
