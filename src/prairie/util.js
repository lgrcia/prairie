function before (object, method, fn) {
  var originalMethod = object[method];
  object[method] = function () {
    fn.apply(object);
    originalMethod.apply(object, arguments);
  };
}

function after (object, method, fn) {
  var originalMethod = object[method];
  object[method] = function () {
    originalMethod.apply(object, arguments);
    fn.call(object);
  };
}

function waitForSocketConnection(socket, callback){
  // https://stackoverflow.com/a/21394730
  setTimeout(
      function () {
          if (socket.readyState === 1) {
              if(callback != null){
                  callback();
              }
              return;
  
          } else {
              console.log("wait for connection...")
              waitForSocketConnection(socket, callback);
          }
  
      }, 5); // wait 5 milisecond for the connection...
  }

  export {before, after, waitForSocketConnection}
