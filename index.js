export default class DebugEvents {

  constructor(contract, tx = null){
      this.contract = contract;
      this.events = this.contractEvents();
      this.tx = tx;
  }

  setTx(tx){
      this.tx = tx;
      return this;
  }

  zip(keys, values) {
      return keys.reduce((obj, k, i) => ({...obj, [k]: values[i] }), {});
  }

  getContractEvents() {
      return this.events;
  }

  contractEvents(){
      let eventDefinitions = {};
      let events = Object.entries(this.contract.events).map(([hash, event]) => {
          event.inputs.forEach(({indexed, name, type}) => {
              if (!eventDefinitions.hasOwnProperty(event.name)) {
                  eventDefinitions[event.name] = {};
              }
              eventDefinitions[event.name][name] = {type, indexed};
          });
      });
      return eventDefinitions;
  }

  getEvent(eventName = false) {
      return this.getEvents(eventName)[0];
  }

  getEvents(eventName = false) {
      if(!this.tx){
          throw 'There is no transaction to get events from';
      }
      
      let logs = this.tx.logs;
      
      if (eventName) {
          logs = logs.filter(({event}) => event === eventName);
      }
      
      return logs.map(({event, args}) => {
              let keys = Object.keys(args);
              let values = Object.values(args)
                  .map((value, index) => this.cleanValue(value, this.events[event][keys[index]].type));
              
              return Object.assign({event}, this.zip(keys, values));
          });
  }   

  cleanValue(value, type='bytes32'){
      if (type === 'bytes32') {
          return this.cleanString(value);
      } else if (type.includes('uint')) {
          return this.cleanUint(value);
      }
      return value;
  }

  cleanString(value){
      return web3.toAscii(value).replace(/\u0000/g, '');
  }

  cleanUint(value){
      return +value;
  }
}