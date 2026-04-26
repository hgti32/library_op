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


export function Log({ 
  level = 'INFO', 
  formatter = defaultJsonFormatter,
  loggerService = defaultLoggerService 
}: LoggerOptions = {}) {
  
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const startTime = performance.now();
      
      const createLogEntry = () => ({
        timestamp: new Date().toISOString(),
        level,
        method: propertyKey,
        args,
      });

      const emitLog = (logData: any, isError = false) => {
        const formattedMessage = formatter(logData);
        if (isError) {
          loggerService.error(formattedMessage);
        } else if (level !== 'ERROR') {
          loggerService.log(formattedMessage);
        }
      };
    };
  };
}