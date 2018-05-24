var express = require('express');
require('./models');
mongoose = require('mongoose');
const Alert = mongoose.model('alerts');
config = require('../config');


alertRouter = express.Router();

alertRouter.route('/')
    .post(function (request, response) {
        filter = {};
        if (request.body instanceof Object && Object.keys(request.body).length !== 0) {
            var payload = request.body.payload;
            console.log(payload);
            if (payload instanceof Object) {
                if (payload.postcode && Array.isArray(payload.postcode)) {
                    filter['address.postcode'] = {
                        '$in': payload.postcode
                    }
                }
                if (payload.state && Array.isArray(payload.state)) {
                    filter['address.state'] = {
                        '$in': payload.state
                    }
                }
                if (payload.suburb && Array.isArray(payload.suburb)) {
                    filter['address.suburb'] = {
                        '$in': payload.suburb
                    }
                }
                if (payload.status && Array.isArray(payload.status)) {
                    filter['status'] = {
                        '$in': payload.status
                    }
                }
                if (payload.provider && Array.isArray(payload.provider)) {
                    filter['provider'] = {
                        '$in': payload.provider
                    }
                }
                var page = 0;
                if (request.body.page && request.body.page >= 0) {
                    page = request.body.page;
                }
                var required = request.body.required || 'alerts';

                if (required === 'alerts') {
                    var query = Alert.find(filter).sort({
                        alerted: -1
                    }).skip(page * config.pageSize).limit(config.pageSize);
                    var count_query = Alert.find(filter).sort({
                        alerted: -1
                    }).count();
                } else {

                    var group;

                    switch (required) {
                        case 'postcode':
                            group = {
                                _id: '$address.postcode'
                            }
                            break;
                        case 'state':
                            group = {
                                _id: '$address.state'
                            }
                            break;
                        case 'suburb':
                            group = {
                                _id: '$address.suburb'
                            }
                            break;
                        case 'status':
                            group = {
                                _id: '$status'
                            }
                            break;
                        case 'provider':
                            group = {
                                _id: '$provider'
                            }
                            break;
                        default:
                            group = {
                                _id: '$provider'
                            }
                    }

                    var query = Alert.aggregate([{
                            $unwind: "$address"
                        },
                        {
                            $match: filter,

                        },
                        {
                            $group: group
                        },
                        {
                            $project: {
                                _id: 0,
                                name: "$_id",
                                count: 1,
                                sum: 1
                            }
                        },
                        {
                            $skip: page * config.pageSize
                        },
                        {
                            $limit: config.pageSize
                        }
                    ]);

                }

                query.exec(function (err, alerts) {
                    if (err) {
                        json_data = JSON.parse(err.data);
                        if (json_data) {
                            response.status('400').json(json_data);
                        } else {
                            response.status('400').json({
                                error: 'Error finding alerts'
                            });
                        }
                    } else {

                        if (typeof count_query !== 'undefined') {

                            count_query.exec(function (err, coun_t) {
                                response.json({
                                    count: coun_t,
                                    data: alerts
                                });
                            })

                        } else {
                            response.json(alerts);
                        }

                    }
                });

            } else {
                response.status('400').json({
                    error: 'Error finding alerts'
                });
            }
        } else {
            response.status('400').json({
                error: 'Error finding alerts'
            });
        }
        // Alert.find({'address.state':'', 'address.postcode': '3646' }).distinct('address.suburb', function(err, alerts) {
        //     console.log(alerts);
        //     response.json(alerts);
        // })

    });

alertRouter.route('/:uuid([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})')
    .get(function (request, response) {
        Alert.findOne({
            uuid: request.params.uuid
        }, function (err, alert) {
            if (err) {
                json_data = JSON.parse(err.data);
                if (json_data) {
                    response.status('400').json(json_data);
                } else {
                    response.status('400').json({
                        'error': 'Error finding the alert'
                    });
                }
            } else if (alert) {
                response.json(alert);
            } else {
                response.status('400').json({
                    'error': 'Error finding the alert'
                });
            }
        })
    });

module.exports = alertRouter;