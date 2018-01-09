"use strict";

const version = require('../package.json').version;
const securitySystemStorage = require('node-persist').create();

const inherits = require('util').inherits;

const NameFactory = require('./util/NameFactory');

let Accessory, Characteristic, Service;

const SwitchStates = [
  'Off',
  'On'
];

class SwitchAccessory {

  constructor(api, log, config) {
    Accessory = api.hap.Accessory;
    Characteristic = api.hap.Characteristic;
    Service = api.hap.Service;

    this.log = log;
    this.name = config.name;
    this.version = config.version;

    this._state = {
      state: false
    };

    this._services = this.createServices();
  }

  getServices() {
    return this._services;
  }

  createServices() {
    return [
      this.getAccessoryInformationService(),
      this.getBridgingStateService(),
      this.getSwitchService()
    ];
  }

  getAccessoryInformationService() {
    return new Service.AccessoryInformation()
      .setCharacteristic(Characteristic.Name, this.name)
      .setCharacteristic(Characteristic.Manufacturer, 'Michael Froehlich')
      .setCharacteristic(Characteristic.Model, 'Switch')
      .setCharacteristic(Characteristic.SerialNumber, '44')
      .setCharacteristic(Characteristic.FirmwareRevision, this.version)
      .setCharacteristic(Characteristic.HardwareRevision, this.version);
  }

  getBridgingStateService() {
    return new Service.BridgingState()
      .setCharacteristic(Characteristic.Reachable, true)
      .setCharacteristic(Characteristic.LinkQuality, 4)
      .setCharacteristic(Characteristic.AccessoryIdentifier, this.name)
      .setCharacteristic(Characteristic.Category, Accessory.Categories.SWITCH);
  }

  getSwitchService() {
    this._switchService = new Service.Switch(this.name);
    this._switchService.getCharacteristic(Characteristic.On)
      .on('set', this._setState.bind(this))
      .updateValue(this._state.state);

    this._switchService.isPrimaryService = true;

    return this._switchService;
  }

  identify(callback) {
    this.log(`Identify requested on ${this.name}`);
    callback();
  }

  _setState(value, callback) {
    this.log(`Change target state of ${this.name} to ${SwitchStates[value]}`);
    this._state.targetState = value;
    callback();
  }
}

module.exports = SwitchAccessory;