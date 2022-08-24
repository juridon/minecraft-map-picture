(function() {
  'use strict';
  const events1 = ['app.record.create.show'];
  kintone.events.on(events1, (event) => {
    const record = event.record;
    console.log(record);
  });
  
})();
