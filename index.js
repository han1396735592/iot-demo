/*
"dependencies": { "aliyun-iot-mqtt": "^0.0.4" }
*/
const mqtt = require('./node_modules/aliyun-iot-mqtt');
 var sensorLib = require('./node_modules/node-dht-sensor');
const Gpio = require('./node_modules/rpio2/lib/index.js').Gpio;
var led = new Gpio(7);  //创建 Pin7 引脚
led.open(Gpio.OUTPUT, Gpio.LOW); //设置为 OUTPUT、默认低电平
 
var sensorType = 11; // 11 for DHT11, 22 for DHT22 and AM2302
var sensorPin  = 16;  // The GPIO pin number for sensor signal
if (!sensorLib.initialize(sensorType, sensorPin)) {
    console.warn('Failed to initialize sensor');
    process.exit(1);
}
 
//设备属性
const options = {
    productKey: "***",
    deviceName: "***",
    deviceSecret: "***",
    regionId: "cn-shanghai"
};
//建立连接
const client = mqtt.getAliyunIotMqttClient(options);
 
client.on('connect', function() {
            console.log('MQTT服务器链接成功!')            
        });
  
client.on('error', function(err) {
            console.log(err)
        });
    
  
 
//属性上报的Topic
const topic = `/sys/${options.productKey}/${options.deviceName}/thing/event/property/post`;
setInterval(function() {
    //发布数据到topic
    client.publish(topic, getPostData());
}, 5 * 1000);
 
 
function getPostData(){   
    var readout = sensorLib.read();
    const payloadJson = {
        id: Date.now(),
        params: {
            temperature: parseFloat(readout.temperature.toFixed(1)),
            humidity: parseFloat(readout.humidity.toFixed(1))
        },
        method: "thing.event.property.post"
    }
 
    console.log("===postData topic=" + topic)
    console.log(payloadJson)
 
    return JSON.stringify(payloadJson);
}
