// jarvis, just another rudimentary verbal interface shell
// converts 'hello "John Doe"' to ['hello', 'John, Doe']
const fs = require("fs");
const path = require("path");
const tokenize = line => {
  const tokens = line.match(/"([^"]+)"|\S+/g);
  for (let i = 0; i < tokens.length; i++) {
    tokens[i] = tokens[i].replace(/"/g, '');
  }
  return tokens;
};
exports.tokenize = tokenize;

// converts 'hello $name' to
// [{value: 'hello', isArg: false}, {value: name, isArg: true}]
const parseCommand = (commandStr) => {
  const tokens = [];
  commandStr.split(" ").forEach(token => {
    tokens.push({
      value: token.replace(/\$/g, ""),
      isArg: token.includes("$")
    });
  });
  return tokens;
};
exports.parseCommand = parseCommand;

// checks tokens against all the patterns in the command
// returns args if match, else null
const parseInputTokens = (command, inputTokens) => {
  for (let i = 0; i < command.patterns.length; i++) { // for each pattern
    const patternTokens = command.patterns[i].tokens;
    if (patternTokens.length === inputTokens.length) {
      const args = {};
      let match = true;
      for (let j = 0; j < patternTokens.length; j++) { // for each token in pattern
        const patternToken = patternTokens[j];
        if (patternToken.isArg) {
          args[patternToken.value] = inputTokens[j];
        } else {
          if (inputTokens[j] !== patternToken.value) {
            match = false;
            break;
          }
        }
      }
      if (match)
        return { args };
    }
  }
  return null;
};

exports.parseInputTokens = parseInputTokens;

// checks tokens against the macro command
// returns args if match, else null
const parseMacroInputTokens = (macro, inputTokens) => {
  const patternTokens = macro.tokens;
  if (patternTokens.length === inputTokens.length) {
    const args = {};
    let match = true;
    for (let j = 0; j < patternTokens.length; j++) { // for each token in pattern
      const patternToken = patternTokens[j];
      if (patternToken.isArg) {
        args[patternToken.value] = inputTokens[j];
      } else {
        if (inputTokens[j] !== patternToken.value) {
          match = false;
          break;
        }
      }
    }
    if (match)
      return { args };
  }
  return null;
};
exports.parseMacroInputTokens = parseMacroInputTokens;

// change variable tokens to values of args
// returns same string if no variables found
const parseMacroSubCommand = (line, args) => {
  let tokens = parseCommand(line);
  let parsedLine = line;
  tokens.forEach((token) => {
    if (token.isArg) {
      if (args[token.value]) {
        parsedLine = parsedLine.replace(`$${token.value}`, `"${args[token.value]}"`);
      }
    }
  })

  return parsedLine;
};
exports.parseMacroSubCommand = parseMacroSubCommand;

// returns string content by reading a script
const parseScript = filename => {
  let content;
  try {
    content = fs.readFileSync(filename, "utf8");
  } catch (error) {
    throw new Error('Could not read file from the specified location!');
  }
  const lines = content.split("\n");
  const filteredCommands = lines.filter(line => {
    return line !== "" && line.trim() !== "" && !line.trim().startsWith("#");
  });
  return filteredCommands;
};
exports.parseScript = parseScript;

// checks the validity of a provided script
const validateScript = (extension, file) => {
  if (path.extname(file) === `.${extension}`) {
    return true;
  }
};
exports.validateScript = validateScript;

//checks whether a given env file/file path matches to a given file name
const validateEnvFileName = (fileName, envFile) => {
  return envFile.split('.').pop() === fileName;
};
exports.validateEnvFileName = validateEnvFileName;

// read and parse the JSON file
// if a valid JSON, returns the parsed JSON object
// else returns an error object
const importJson = (filename) => {
  try {
    const content = fs.readFileSync(filename, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { error: 'Could not read the JSON file from the specified location!' };
    } else {
      return { error: 'Invalid JSON import!' };
    }
  }
}
exports.importJson = importJson;
