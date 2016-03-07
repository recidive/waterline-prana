/**
 * Module Dependencies
 */
var waterlineCriteria = require('waterline-criteria');
var Errors = require('waterline-errors').adapter;
var _ = require('lodash');

/**
 * Waterline Adapter for Prana.
 */
module.exports = (function () {

  // Hold connections for this adapter.
  var connections = {};

  // Hold collections for connections.
  var connectionCollections = {};

  // Hold prana instance.
  var application = null;

  var adapter = {

    // Primary keys (machine names) are strings.
    pkFormat: 'string',

    // No need to sync schema on server start.
    syncable: false,

    // Default configuration for collections.
    defaults: {

      // Set collections to be schemaless.
      schema: false
    },

    /**
     * Set the Prana application instance that will be used by all connections.
     */
    setApplication: function(app) {
      application = app;
    },

    /**
     * Register A Connection.
     */
    registerConnection: function (connection, collections, callback) {
      if (!connection.identity) {
        return callback(Errors.IdentityMissing);
      }

      if (connections[connection.identity]) {
        return callback(Errors.IdentityDuplicate);
      }

      connectionCollections[connection.identity] = collections;

      // @todo: in the long run we may want to support multiple Prana instances.
      connections[connection.identity] = application;
      callback();
    },

    /**
     * Teardown a Connection.
     */
    teardown: function (connection, callback) {
      // No connection argument, connection is actually the callback.
      if (typeof connection == 'function') {
        callback = connection;
        connection = null;
      }

      // If no connection was given, delete all connections.
      if (connection == null) {
        connections = {};
        return callback();
      }

      if (connections[connection]) {
        delete connections[connection];
      }

      callback();
    },

    /**
     * Collect items from all enabled extensions.
     */
    find: function(connectionName, collectionName, options, callback) {
      var application = connections[connectionName];
      var collection = connectionCollections[connectionName] && connectionCollections[connectionName][collectionName] || null;

      if (!collection) {
        return callback(new Error('Collection not found'));
      }

      // Collect data from all extensions.
      application.collect(collectionName, function(error, data) {
        if (error) {
          return callback(error);
        }

        var dataArray = Object.keys(data).map(function(key) {
          var singleData = {};

          // Add primaryKey as an property.
          singleData[collection.primaryKey] = key;

          return _.extend(singleData, data[key]);
        });

        // Filter data based on options criteria.
        var resultSet = waterlineCriteria(dataArray, options);

        callback(null, resultSet.results);
      });
    },

  };

  // Expose adapter definition.
  return adapter;

})();
