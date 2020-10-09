// jshint esversion: 9
const { runNimCommand} = require('nimbella-cli');
const nimDeployer = require('nimbella-cli/lib/deployer');

async function loginAuth(auth) {
  await runNimCommand('auth/login', ['--auth=' + auth]);
}

/**
 * @description Run the user command
 * @param {ParamsType} params list of command parameters
 * @param {?string} commandText text message
 * @param {!object} [secrets = {}] list of secrets
 * @return {Promise<SlackBodyType>} Response body
 */
async function _command(params, commandText, secrets = {}) {
  let res;

  try {
    await loginAuth(secrets.auth);
    nimDeployer.initializeAPI("nimbella-cli");
    res = await runNimCommand('web/list', ['--namespace=' + secrets.namespace]);
    res = res.table;
  } catch (e) {
    console.log('getWeb Error:', e.message);
    res = e.message;
  }
  return {
    response_type: 'in_channel', // or `ephemeral` for private response
    text: res
  };
}

/**
 * @typedef {object} SlackBodyType
 * @property {string} text
 * @property {'in_channel'|'ephemeral'} [response_type]
 */

const main = async args => ({
  body: await _command(
    args.params,
    args.commandText,
    args.__secrets || {}
  ).catch(error => ({
    // To get more info, run `/nc activation_log` after your command executes
    response_type: 'ephemeral',
    text: `Error: ${error.message}`,
  })),
});
module.exports = main;
