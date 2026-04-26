type LogLevel = 'INFO' | 'DEBUG' | 'ERROR';

interface LoggerOptions {
  level?: LogLevel;
  formatter?: (data: any) => string;
  loggerService?: { log: (msg: string) => void; error: (msg: string) => void };
}

const defaultJsonFormatter = (data: any) => JSON.stringify(data);

const defaultLoggerService = {
  log: (msg: string) => console.log(msg),
  error: (msg: string) => console.error(msg),
};