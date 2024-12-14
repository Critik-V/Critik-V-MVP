import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

// Load environment variables from .env file and expand them if necessary (e.g. for variables containing references to other variables)
// This is a simple way to load environment variables from a .env file and make them available in all files of the project.
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

export default process.env;
