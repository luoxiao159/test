var util = require('util.js');
var wxTimer = function(initObj) {
    initObj = initObj || {};
    this.i = initObj.i || 0;
    this.days = initObj.days || 0;
    this.showDay = initObj.showDay != undefined ? initObj.showDay : true;
    this.beginTime = initObj.beginTime || "00:00:00"; //开始时间
    this.interval = initObj.interval || 1; //间隔时间
    this.complete = initObj.complete; //结束任务
    this.intervalFn = initObj.intervalFn; //间隔任务
    this.name = initObj.name; //当前计时器在计时器数组对象中的名字

    this.intervarID; //计时ID
    this.endTime; //结束时间
    this.endSystemTime; //结束的系统时间
}

wxTimer.prototype = {
    //开始
    start: function(self) {
        var endDate = new Date("1970/01/01 " + this.beginTime)
        this.endTime = endDate.getTime(); //1970年1月1日的00：00：00的字符串日期
        endDate.setDate(endDate.getDate() + this.days)
        this.endTime = endDate.getTime();
        this.endSystemTime = new Date(Date.now() + this.endTime);
        var that = this;
        //开始倒计时
        var count = 0; //这个count在这里应该是表示s数，js中获得时间是ms，所以下面*1000都换成ms
        function begin() {
            var tmpTime = new Date(that.endTime - 1000 * count++);
            //把2011年1月1日日 00：00：00换成数字型，这样就可以直接1s，1s的减，就变成了倒计时，为了看的更明确，又用new date把字符串换回来了
            var tmpTimeStr = tmpTime.toString().substr(16, 8); //去掉前面的年月日就剩时分秒了
            var wxTimerSecond = (tmpTime.getTime() - new Date("1970/01/01 00:00:00").getTime()) / 1000;
            var wxTimerList = self.data.wxTimerList;
            var timerObj = util.msecToDays(wxTimerSecond * 1000, that.showDay);
            var wxTimerObj = {
                hours: (timerObj.hours + '').length < 2 ? '0' + timerObj.hours : timerObj.hours,
                minutes: (timerObj.minutes + '').length < 2 ? '0' + timerObj.minutes : timerObj.minutes,
                seconds: (timerObj.seconds + '').length < 2 ? '0' + timerObj.seconds : timerObj.seconds
            }
            if (that.showDay) {
                wxTimerObj.days = timerObj.days;
            }

            //更新计时器数组
            wxTimerList[that.name] = {
                wxTimer: tmpTimeStr,
                wxTimerSecond: wxTimerSecond,
            }

            /*self.setData({
                wxTimer: tmpTimeStr,
                wxTimerSecond: wxTimerSecond,
                wxTimerList: wxTimerList
            });*/
            //时间间隔执行函数
            if (0 == (count - 1) % that.interval && that.intervalFn) {
                that.intervalFn(that.i, wxTimerObj);
            }
            //结束执行函数
            if (wxTimerSecond <= 0) {
                if (that.complete) {
                    that.complete();
                }
                that.stop();
            }
        }
        begin();
        this.intervarID = setInterval(begin, 1000);
    },
    //结束
    stop: function() {
        clearInterval(this.intervarID);
    },
    //校准
    calibration: function() {
        this.endTime = this.endSystemTime - Date.now();
    }
}

module.exports = wxTimer;