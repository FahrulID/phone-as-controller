const feeder = require("./feeder")
var controllers = {}

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 7200;

const buttons = {
    a : "A",
    b : "B",
    y : "Y",
    x : "X",
    rb : "RIGHT_SHOULDER",
    lb : "LEFT_SHOULDER",
    start : "START",
    back : "BACK"
}

const axes = {
    leftAnalog : "left",
    rightAnalog: "right"
}