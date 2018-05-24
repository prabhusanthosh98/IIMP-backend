var express = require('express');
require('./models');
mongoose = require('mongoose');
const Alert = mongoose.model('alerts');
config = require('../config');


chartRoute = express.Router();

chartRoute.route('/provider_last7')
    .get(function (request, response) {
        var d = new Date();
        var startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 6, -14);
        var endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, -14);


        var query = Alert.aggregate([{
                $match: {
                    "alerted": {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $addFields: {
                    alerted_temp: {
                        $dateFromParts: {
                            year: {
                                $year: "$alerted"
                            },
                            month: {
                                $month: "$alerted"
                            },
                            day: {
                                $dayOfMonth: "$alerted"
                            }
                        }
                    },
                    daterange: {
                        $map: {
                            input: {
                                $range: [0, {
                                    $subtract: [endDate, startDate]
                                }, 1000 * 60 * 60 * 24]
                            },
                            in: {
                                $add: [startDate, "$$this"]
                            }
                        }
                    }
                }
            },
            {
                $unwind: "$daterange"
            },
            {
                $group: {
                    _id: {
                        date: "$alerted_temp",
                        provider: "$provider"
                    },
                    count: {
                        $sum: {
                            $cond: [{
                                $eq: ["$alerted_temp", "$daterange"]
                            }, 1, 0]
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    total: {
                        $sum: "$count"
                    },
                    byProvider: {
                        $push: {
                            k: "$_id.provider",
                            v: {
                                $sum: "$count"
                            }
                        }
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    total_alerts: "$total",
                    by_provider: {
                        $arrayToObject: {
                            $filter: {
                                input: "$byProvider",
                                cond: "$$this.v"
                            }
                        }
                    }
                }
            }
        ]);
        var query_provider = Alert.aggregate([{
            $match: {
                "alerted": {
                    $gte: startDate,
                    $lt: endDate
                }
            }
        }, {
            $group: {
                _id: '$provider'
            }
        }, {
            $project: {
                _id: 0,
                name: "$_id",
                count: 1,
                sum: 1
            }
        }]);
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


                query_provider.exec(function (pro_err, provider_list) {
                    if (pro_err) {
                        response.status('400').json({
                            error: 'Error finding alerts'
                        });
                    } else {
                        data = {};
                        data.provider = []
                        data.total = []
                        data.dates = []
                        provider_list.map(i => {
                            data.provider.push(i.name)
                            data[i.name] = []
                        });

                        // Create base lists:
                        alerts.map(j => {
                            var temp = new Date(j.date);
                            data.dates.push(dateToYMD(temp));
                            data.total.push(j.total_alerts);
                            data.provider.map(k => {
                                if (j.by_provider[k]) {
                                    data[k].push(j.by_provider[k])
                                } else {
                                    data[k].push(0)
                                }
                            })
                        });

                        response.json(data);
                    }
                })


            }


        });

    });

chartRoute.route('/states_last7')
    .get(function (request, response) {
        var d = new Date();
        var startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 5, -14);
        var endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 2, -14);


        var query = Alert.aggregate([{
                $match: {
                    "alerted": {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $addFields: {
                    alerted_temp: {
                        $dateFromParts: {
                            year: {
                                $year: "$alerted"
                            },
                            month: {
                                $month: "$alerted"
                            },
                            day: {
                                $dayOfMonth: "$alerted"
                            }
                        }
                    },
                    daterange: {
                        $map: {
                            input: {
                                $range: [0, {
                                    $subtract: [endDate, startDate]
                                }, 1000 * 60 * 60 * 24]
                            },
                            in: {
                                $add: [startDate, "$$this"]
                            }
                        }
                    }
                }
            },
            {
                $unwind: "$daterange"
            },
            {
                $group: {
                    _id: {
                        date: "$alerted_temp",
                        state: "$address.state"
                    },
                    count: {
                        $sum: {
                            $cond: [{
                                $eq: ["$alerted_temp", "$daterange"]
                            }, 1, 0]
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    total: {
                        $sum: "$count"
                    },
                    byState: {
                        $push: {
                            k: "$_id.state",
                            v: {
                                $sum: "$count"
                            }
                        }
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    total_alerts: "$total",
                    by_state: {
                        $arrayToObject: {
                            $filter: {
                                input: "$byState",
                                cond: "$$this.v"
                            }
                        }
                    }
                }
            }
        ]);
        var query_state = Alert.aggregate([{
            $match: {
                "alerted": {
                    $gte: startDate,
                    $lt: endDate
                }
            }
        }, {
            $group: {
                _id: '$address.state'
            }
        }, {
            $project: {
                _id: 0,
                name: "$_id",
                count: 1,
                sum: 1
            }
        }]);
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


                query_state.exec(function (sta_err, state_list) {
                    if (sta_err) {
                        response.status('400').json({
                            error: 'Error finding alerts'
                        });
                    } else {
                        data = {};
                        data.states = []
                        data.total = []
                        data.dates = []
                        state_list.map(i => {
                            data.states.push(i.name)
                            data[i.name] = []
                        });

                        // Create base lists:
                        alerts.map(j => {
                            var temp = new Date(j.date);
                            data.dates.push(dateToYMD(temp));
                            data.total.push(j.total_alerts);
                            data.states.map(k => {
                                if (j.by_state[k]) {
                                    data[k].push(j.by_state[k])
                                } else {
                                    data[k].push(0)
                                }
                            })
                        });

                        response.json(data);
                    }
                })
            }


        });

    });





chartRoute.route('/states_total')
    .get(function (request, response) {

        var query = Alert.aggregate([{
            $group: {
                _id: {
                    state: "$address.state"
                },
                count: {
                    $sum: 1
                }
            }
        }, {
            $project: {
                _id: 0,
                state: "$_id.state",
                total_alerts: "$count"
            }
        }]);

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
                response.json(alerts);
            }


        });

    });


chartRoute.route('/provider_total')
    .get(function (request, response) {

        var query = Alert.aggregate([{
            $group: {
                _id: {
                    provider: "$provider"
                },
                count: {
                    $sum: 1
                }
            }
        }, {
            $project: {
                _id: 0,
                provider: "$_id.provider",
                total_alerts: "$count"
            }
        }]);

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
                response.json(alerts);
            }


        });

    });



chartRoute.route('/status_total')
    .get(function (request, response) {

        var query = Alert.aggregate([{
            $group: {
                _id: {
                    status: "$status"
                },
                count: {
                    $sum: 1
                }
            }
        }, {
            $project: {
                _id: 0,
                status: "$_id.status",
                total_alerts: "$count"
            }
        }]);

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
                response.json(alerts);
            }


        });

    });

// chartRoute.route('/provider_total_yeat')
// chartRoute.route('/alert_status')

module.exports = chartRoute;



function dateToYMD(date) {
    var strArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = date.getDate();
    var m = strArray[date.getMonth()];
    var y = date.getFullYear();
    return '' + (d <= 9 ? '0' + d : d) + '-' + m + '-' + y;
}