'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Provider = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Default provider
 */

var Provider = exports.Provider = function () {
  function Provider(config) {
    _classCallCheck(this, Provider);

    this.config = config;
  }

  _createClass(Provider, [{
    key: 'signin',
    value: function signin(_ref, callback) {
      var signin_uri = _ref.signin_uri;
      var scope = _ref.scope;
      var state = _ref.state;
      var response_type = _ref.response_type;
      var _config = this.config;
      var id = _config.id;
      var redirect_uri = _config.redirect_uri;

      var params = {
        client_id: id,
        redirect_uri: redirect_uri
      };
      if (response_type) {
        params.response_type = response_type;
      }
      if (scope) {
        params.scope = scope;
      }
      if (state) {
        params.state = state;
      }
      if (!params.client_id || !params.redirect_uri) {
        callback('Invalid sign in params. ' + params.client_id + ' ' + params.redirect_uri);
      } else {
        var url = _utils.Utils.urlBuilder(signin_uri, params);
        callback(null, { url: url });
      }
    }
  }, {
    key: 'callback',
    value: function callback(_ref2, _ref3, additionalParams, cb) {
      var code = _ref2.code;
      var state = _ref2.state;
      var authorization_uri = _ref3.authorization_uri;
      var profile_uri = _ref3.profile_uri;
      var profileMap = _ref3.profileMap;
      var authorizationMethod = _ref3.authorizationMethod;
      var authorization = additionalParams.authorization;
      var profile = additionalParams.profile;
      var _config2 = this.config;
      var id = _config2.id;
      var redirect_uri = _config2.redirect_uri;
      var secret = _config2.secret;
      var provider = _config2.provider;

      _async2.default.waterfall([function (callback) {
        var mandatoryParams = {
          client_id: id,
          redirect_uri: redirect_uri,
          client_secret: secret,
          code: code
        };
        var payload = Object.assign(mandatoryParams, authorization);
        if (authorizationMethod === 'GET') {
          var url = _utils.Utils.urlBuilder(authorization_uri, payload);
          _request2.default.get(url, callback);
        } else {
          _request2.default.post(authorization_uri, { form: payload }, callback);
        }
      }, function (response, accessData, callback) {
        if (!accessData) {
          callback('No access data');
        }

        var _JSON$parse = JSON.parse(accessData);

        var access_token = _JSON$parse.access_token;

        var url = _utils.Utils.urlBuilder(profile_uri, Object.assign({ access_token: access_token }, profile));
        _request2.default.get(url, function (error, httpResponse, profileData) {
          if (error) {
            callback(error);
          } else if (!profileData) {
            callback('No profile data');
          } else {
            var profileJson = JSON.parse(profileData);
            profileJson.provider = provider;
            var mappedProfile = profileMap ? profileMap(profileJson) : profileJson;
            callback(null, mappedProfile);
          }
        });
      }], function (err, data) {
        cb(err, data, state);
      });
    }
  }]);

  return Provider;
}();