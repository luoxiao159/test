// utils/util.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

// 网络请求

// GET请求
function GET(requestHandler) {
    request('GET', requestHandler)
}
// POST请求
function POST(requestHandler) {
    request('POST', requestHandler)
}

function request(method, requestHandler) {
    var app = getApp();

    if (requestHandler.showLoading != false) {
        var title = requestHandler.loadingTitle != undefined ? requestHandler.loadingTitle : '正在加载';
        wx.showLoading({
            title: title,
            mask: true
        })
    }

    //if (app.globalData.w2w_session != null && app.globalData.w2w_session != '') {
    //	requestHandler.params = Object.assign({}, requestHandler.params, { w2w_session: app.globalData.w2w_session });
    //}


    wx.request({
        url: requestHandler.url,
        data: requestHandler.params,
        method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': '',
        },
        success: res => {
            if (requestHandler.showLoading != false) {
                wx.hideLoading();
            }
            if (res.header['X-W2W-Session-Invalid'] == 'True') {
                app.logout();
                return;
            }
            if (res.header['X-W2W-Session-Refresh'] == 'True') {
                wx.login({
                    success: res => {
                        console.log('wx.login成功', res);
                        app.data.js_code = res.code
                        wx.getUserInfo({
                            success: res => {
                                app.login(res);
                            },
                            fail: () => {
                                app.logout();
                            }
                        })
                    }
                })
            }

            if (res.statusCode != 200 || (res.data && res.data.code && res.data.message)) {
                wx.showToast({
                    icon: 'none',
                    title: res.data.message || '加载失败，请尝试刷新',
                })
                if (requestHandler.fail) requestHandler.fail(res.data);
            } else {
                if (requestHandler.success) requestHandler.success(res.data);
                // 订阅消息
                if (res.data && res.data.subscribe_template_ids) {
                    wx.requestSubscribeMessage({
                        tmplIds: res.data.subscribe_template_ids,
                    });
                }
            }
        },
        fail: res => {
            if (requestHandler.showLoading != false) {
                wx.hideLoading();
            }
            var err = res.errMsg,
                msg = err;
            if (err == 'request:fail url not in domain list') {
                msg = '请添加你的网站网址到小程序后台request合法域名，如已添加，请刷新项目配置';
            } else if (/interrupted/.test(err)) {

            }
            wx.showModal({
                title: '提示',
                content: msg,
                showCancel: false
            })
            /*wx.showToast({
                icon: 'none',
                title: msg || '加载失败，请尝试刷新',
            })*/
            if (requestHandler.fail) requestHandler.fail(res.data);
        },
        complete: (res) => {
            wx.stopPullDownRefresh();
            console.log(method + '请求' + requestHandler.url + ': (参数 ' + JSON.stringify(requestHandler.params) + ')', res);
            if (requestHandler.complete) requestHandler.complete();
        }
    })
}

// 日期格式转换
function dateFormat(fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

// 数组去重
function unique(arr) {
    var result = [],
        hash = {};
    for (var i = 0, elem;
        (elem = arr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
}

function cloneObj(obj) {
    var str, newobj = obj.constructor === Array ? [] : {};
    if (typeof obj !== 'object') {
        return;
    } else if (JSON) {
        str = JSON.stringify(obj),
            newobj = JSON.parse(str);
    } else {
        for (var i in obj) {
            newobj[i] = typeof obj[i] === 'object' ?
                cloneObj(obj[i]) : obj[i];
        }
    }
    return newobj;
};

var states = {
    CN1: '云南省',
    CN2: '北京市',
    CN3: '天津市',
    CN4: '河北省',
    CN5: '山西省',
    CN6: '内蒙古自治区',
    CN7: '辽宁省',
    CN8: '吉林省',
    CN9: '黑龙江省',
    CN10: '上海市',
    CN11: '江苏省',
    CN12: '浙江省',
    CN13: '安徽省',
    CN14: '福建省',
    CN15: '江西省',
    CN16: '山东省',
    CN17: '河南省',
    CN18: '湖北省',
    CN19: '湖南省',
    CN20: '广东省',
    CN21: '广西壮族自治区',
    CN22: '海南省',
    CN23: '重庆市',
    CN24: '四川省',
    CN25: '贵州省',
    CN26: '陕西省',
    CN27: '甘肃省',
    CN28: '青海省',
    CN29: '宁夏回族自治区',
    CN30: '澳门特别行政区',
    CN31: '西藏自治区',
    CN32: '新疆维吾尔自治区'
};

// 省名获取省代码
function getStateCode(provinceName) {
    for (var stateCode in states) {
        if (states[stateCode] == provinceName) {
            return stateCode;
        }
    }
}

// 省代码获取省名
function getStateName(stateCode) {
    return states[stateCode];
}

// 获取提交/显示的地址
function addressTransform(address, type = 'submit') {
    if (type == 'post') {
        var newAddress = {};
        for (var name in address) {
            if (typeof address[name] == 'object') {
                for (var attr in address[name]) {
                    newAddress[name + '[' + attr + ']'] = address[name][attr];
                }
            } else {
                newAddress[name] = address[name];
            }
        }
    } else {
        var attr = type == 'submit' ? 'id' : 'label';
        var newAddress = cloneObj(address);
        newAddress.billing_country = newAddress.billing_country[attr];
        if (typeof newAddress.billing_state == 'object') {
            newAddress.billing_state = newAddress.billing_state[attr] == null ? newAddress.billing_state['label'] : newAddress.billing_state[attr];
        }
    }
    return newAddress;
}

// 精确的乘法运算
function mul(arg1, arg2) {
    var m = 0,
        s1 = arg1.toString(),
        s2 = arg2.toString();
    try {
        m += s1.split('.')[1].length
    } catch (e) {}
    try {
        m += s2.split('.')[1].length
    } catch (e) {}
    return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m)
}

// 数组是否存在某元素
function inArray(search, array) {
    for (var i in array) {
        if (array[i] == search) {
            return i;
        }
    }
    return -1;
}

// 获取订单状态对象
function getOrderStatusObj() {
    return {
        pending: '待付款',
        processing: '待发货',
        shipped: '待收货',
        'on-hold': '保留',
        completed: '待评价',
        cancelled: '已取消',
        refunded: '已退款',
        failed: '失败订单',
        pending_groupon: '待成团',
    };
}

// 获取订单状态
function getOrderStatus(status) {
    var status_obj = getOrderStatusObj();
    return status_obj[status];
}

// 去除html标签，但保留标签内容
function stripHTML(str) {
    str = str.replace(/<\/?.+?>/g, '');
    str = str.replace(/[\r\n]/g, ''); //去掉回车换行    
    return str.trim();
}

// 字符串长度
function getStrLength(str) {
    return str.replace(/[\u0391-\uFFE5]/g, 'aa').length;
}

// 计算日期相差天时分秒
function diffTime(startDate, endDate, showDay = true) {
    var diff = endDate.getTime() - startDate.getTime(); //时间差的毫秒数
    return msecToDays(diff, showDay);
}

// 毫秒计算天时分秒
function msecToDays(msec, showDay = true) {
    //计算出相差天数  
    var days = Math.floor(msec / (24 * 3600 * 1000));

    //计算出小时数  
    var leave1 = showDay ? msec % (24 * 3600 * 1000) : msec; //计算天数后剩余的毫秒数  
    var hours = Math.floor(leave1 / (3600 * 1000));
    //计算相差分钟数  
    var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数  
    var minutes = Math.floor(leave2 / (60 * 1000));

    //计算相差秒数  
    var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数  
    var seconds = Math.round(leave3 / 1000);

    var obj = {
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
    if (showDay) {
        obj.days = days;
    }
    return obj;
}

// 获取时间戳
function getTimestamp() {
    return Math.round(+new Date() / 1000);
}

// 等比例调整尺寸及居中
function resizeRect(ognW, ognH, newW, newH, mode = 'aspectFill') {
    var sX = 0,
        sY = 0,
        sWidth = ognW,
        sHeight = ognH,
        dX = 0,
        dY = 0,
        dWidth = newW,
        dHeight = newH;

    // 铺满整个容器的宽高，图片多出的部分会被截掉
    if (mode == 'aspectFill') {
        if (ognW / ognH < newW / newH) {
            sY = (ognH - (ognW / newW * newH)) / 2;
            sHeight = sHeight - sY * 2;
        } else {
            sX = (ognW - (ognH / newH * newW)) / 2;
            sWidth = sWidth - sX * 2;
        }
    }
    // 图片自身能完全显示出来，容器会有留白区域
    else if (mode == 'aspectFit') {
        if (ognW / ognH < newW / newH) {
            dX = (newW - (ognW / ognH * newH)) / 2;
            dWidth = dWidth - dX * 2;
        } else {
            dY = (newH - (ognH / ognW * newW)) / 2;
            dHeight = dHeight - dY * 2;
        }
    }

    return {
        sX: sX,
        sY: sY,
        sWidth: sWidth,
        sHeight: sHeight,
        dX: dX,
        dY: dY,
        dWidth: dWidth,
        dHeight: dHeight,
    };
}

// 对象转URL参数
function serialize(obj) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(p + "=" + obj[p]);
        }
    return str.join("&");
}

// canvas文本换行
function canvasSplitText(ctx, text, width) {
    var totalWidth = 0,
        index = 0,
        length = 0,
        textArr = [];
    while (index < text.length) {
        while (totalWidth < width && index + length <= text.length) {
            length++;
            var metrics = ctx.measureText(text.substr(index, length));
            totalWidth = metrics.width;
        }
        length--;
        textArr.push(text.substr(index, length));
        index += length;
        totalWidth = 0;
        length = 0;
    }
    return textArr;
}

// 获取随机数
function getRandom(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

// 获取随机字符串
function getNonce(len) {
    len = len || 16;
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var maxPos = chars.length;
    var nonce = '';
    for (var i = 0; i < len; i++) {
        nonce += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return nonce;
}

function lightOrDark(color) {
    if (!color) {
        return 0;
    }

    // Variables for red, green, blue values
    var r, g, b, hsp;

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {
        // If HEX --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

        r = color[1];
        g = color[2];
        b = color[3];
    } else {
        // If RGB --> Convert it to HEX: http://gist.github.com/983661
        color = +("0x" + color.slice(1).replace(
            color.length < 5 && /./g, '$&$&'));

        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    );

    // Using the HSP value, determine whether the color is light or dark
    //console.log(hsp);
    if (hsp > 155) {
        return 'light'; // light
    } else {
        return 'dark'; // dark
    }
}

function getVideoInfo(that, vid) {
    var videoUrl = 'https://vv.video.qq.com/getinfo?otype=json&appver=3.2.19.333&platform=11&defnpayver=1defn=shd&vid=' + vid;
    GET({
        url: videoUrl,
        success: data => {
            var dataJson = data.replace(/QZOutputJson=/, '') + 'qwe',
                dataJson1 = dataJson.replace(/;qwe/, ''),
                data = JSON.parse(dataJson1),
                fn_pre = data.vl.vi[0].lnk,
                streams = data['fl']['fi'],
                seg_cnt = data['vl']['vi'][0]['cl']['fc'],
                host = '';

            for (var i in data['vl']['vi'][0]['ul']['ui']) {
                console.log(data['vl']['vi'][0]['ul']['ui'][i]['url']);
                if (data['vl']['vi'][0]['ul']['ui'][i]['url'].indexOf('tc.qq.com') != -1) {
                    host = data['vl']['vi'][0]['ul']['ui'][i]['url'];
                    break;
                }
            }
            if (parseInt(seg_cnt) == 0) {
                seg_cnt = 1
            }
            var best_quality = streams[streams.length - 1]['name'],
                part_format_id = streams[streams.length - 1]['id'];

            /*for (var i = 1; i < (seg_cnt + 1); i++) {*/
            var filename = fn_pre + '.p' + (part_format_id % 10000) + '.' + 1 + '.mp4';
            requestVideoUrls(that, host, part_format_id, vid, filename);
        }
    })
}

function requestVideoUrls(that, host, part_format_id, vid, fileName) {
    var keyApi = "https://vv.video.qq.com/getkey?otype=json&platform=11&format=" + part_format_id + "&vid=" + vid + "&filename=" + fileName + "&appver=3.2.19.333"
    GET({
        url: keyApi,
        success: data => {
            var dataJson = data.replace(/QZOutputJson=/, '') + 'qwe',
                dataJson1 = dataJson.replace(/;qwe/, ''),
                data = JSON.parse(dataJson1);

            if (data.key != undefined) {
                var vkey = data['key'],
                    url = host + fileName + '?vkey=' + vkey;
                console.log(url);

                that.setData({
                    videoUrl: url
                });
            }
        }
    })
}

function queryStrToObj(str) {
    return str.split('&').reduce(function(prev, curr, i, arr) {
        var p = curr.split('=');
        prev[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
        return prev;
    }, {});
}

function objToQueryString(obj) {
    return Object.keys(obj).map(key => key + '=' + obj[key]).join('&');
}

function updateQueryParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
}

module.exports.network = {
    GET: GET,
    POST: POST
}

module.exports.dateFormat = dateFormat;
module.exports.unique = unique;
module.exports.cloneObj = cloneObj;
module.exports.getStateCode = getStateCode;
module.exports.getStateName = getStateName;
module.exports.addressTransform = addressTransform;
module.exports.mul = mul;
module.exports.inArray = inArray;
module.exports.getOrderStatusObj = getOrderStatusObj;
module.exports.getOrderStatus = getOrderStatus;
module.exports.stripHTML = stripHTML;
module.exports.getStrLength = getStrLength;
module.exports.diffTime = diffTime;
module.exports.msecToDays = msecToDays;
module.exports.resizeRect = resizeRect;
module.exports.getTimestamp = getTimestamp;
module.exports.serialize = serialize;
module.exports.canvasSplitText = canvasSplitText;
module.exports.getRandom = getRandom;
module.exports.lightOrDark = lightOrDark;
module.exports.getNonce = getNonce;
module.exports.getVideoInfo = getVideoInfo;
module.exports.queryStrToObj = queryStrToObj;
module.exports.objToQueryString = objToQueryString;
module.exports.updateQueryParameter = updateQueryParameter;