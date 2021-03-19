const {transports, createLogger, format} = require('winston');

var logger = createLogger({ format: format.combine(
  format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
  }),
  format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`+(info.splat!==undefined?`${info.splat}`:" "))
), 
transports: [
  new (transports.Console)({ level: "info" }),
 ]
});


module.exports = logger;