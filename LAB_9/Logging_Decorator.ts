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


function Log({ 
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

      try {
        const result = originalMethod.apply(this, args);

        if (result instanceof Promise) {
          return result
            .then((resolvedValue) => {
              const executionTime = `${(performance.now() - startTime).toFixed(2)}ms`;
              emitLog({ ...createLogEntry(), result: resolvedValue, executionTime });
              return resolvedValue;
            })
            .catch((error) => {
              const executionTime = `${(performance.now() - startTime).toFixed(2)}ms`;
              emitLog({ ...createLogEntry(), level: 'ERROR', error: error.message || error, executionTime }, true);
              throw error;
            });
        }
        const executionTime = `${(performance.now() - startTime).toFixed(2)}ms`;
        emitLog({ ...createLogEntry(), result, executionTime });
        
        return result;

      } catch (error: any) {
        const executionTime = `${(performance.now() - startTime).toFixed(2)}ms`;
        emitLog({ ...createLogEntry(), level: 'ERROR', error: error.message || error, executionTime }, true);
        throw error;
      }
    };

    return descriptor;

  };
}


class UserService {
  @Log()
  syncMethodSuccess(a: number, b: number) {
    return a + b;
  }

  @Log({ level: 'DEBUG' })
  async asyncMethodSuccess(userId: number) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ id: userId, name: "Marko" }), 500);
    });
  }

  @Log({ level: 'ERROR' })
  riskyMethod(shouldFail: boolean) {
    if (shouldFail) {
      throw new Error("Something went terribly wrong!");
    }
    return "Success, but you won't see this in logs.";
  }
}