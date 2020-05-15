// pages/order-detail/order-detail.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const Timer = require('../../utils/wxTimer.js');
const app = getApp();

Page(Object.assign({}, app.Methods, {
    data: Object.assign({}, app.Variables, {
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '订单详情',
        currency: app.data.currency,
        order: null,
        wxTimerList: {},
    }),
    // 好友代付款
    payByFriend() {
        this.makePayment();
    },
    // 打开好友代付弹窗
    showPayByFriendPopup() {
        this.setData({
            isPayByFriendPopup: true
        });
    },
    // 关闭好友代付弹窗
    closePayByFriendPopup() {
        this.setData({
            isPayByFriendPopup: false
        });
    },
    // 取消订单
    cancelOrder(e) {
        app.cancelOrder({
            id: this.options.id,
            success: data => {
                wx.showToast({
                    title: '已取消',
                    success: () => {
                        setTimeout(() => {
                            this.onPullDownRefresh();
                        }, 1500);
                    }
                });
            }
        });
    },
    // 立即支付按钮点击
    payBtnClick() {
        if (app.data.paymentPopup) {
            this.openPaymentChoosePopup();
        } else {
            this.makePayment();
        }
    },
    // 打开支付方式弹窗
    openPaymentChoosePopup() {
        this.setData({
            isPaymentChoosePopup: true
        });
    },
    // 关闭支付方式弹窗
    closePaymentChoosePopup() {
        this.setData({
            isPaymentChoosePopup: false
        });
    },
    // 提示引导打开浏览器
    showCopyPayURL() {
        this.closePaymentChoosePopup();
        wx.showModal({
            title: '提示',
            content: '当前支付方式需要复制支付链接到浏览器打开完成支付',
            showCancel: true,
            confirmText: '复制链接',
            confirmColor: this.data.mainColor,
            success: res => {
                if (res.confirm) {
                    var url = this.data.order.pay_url + '&w2w_session=' + app.data.w2w_session;
                    app.setClipboard(url);
                }
            }
        })
    },
    makeWeChatPayment() {
        this.closePaymentChoosePopup();
        this.makePayment();
    },
    // 发起支付
    makePayment() {
        app.requestPayment({
            id: this.options.id,
            success: res => {
                wx.showToast({
                    title: '已支付',
                    success: () => {
                        setTimeout(() => {
                            this.onLoad(this.options);
                        }, 1500);
                    }
                });
            },
            fail: res => {
                if (res.errMsg == 'requestPayment:fail cancel') {
                    return;
                }
                var msg = res.err_code_des || '支付暂时出现问题，请稍候再试';
                wx.showToast({
                    icon: 'none',
                    title: msg,
                });
            }
        })
    },
    goProductDetail(e) {
        app.goProductDetail(e);
    },
    goShippingDetail() {
        wx.navigateTo({
            url: '/pages/shipping-detail/shipping-detail?id=' + this.options.id
        })
    },
    goGrouponResult() {
        wx.navigateTo({
            url: '/pages/groupon-result/groupon-result?groupon_id=' + this.data.order.groupon.groupon_id
        })
    },
    // 确认收货
    confirmOrderReceived() {
        app.confirmOrderReceived({
            id: this.options.id,
            success: data => {
                wx.showToast({
                    title: '已确认',
                    success: () => {
                        setTimeout(() => {
                            this.onPullDownRefresh();
                        }, 1500);
                    }
                });
            }
        });
    },
    // 跳转评价列表
    goOrderReviewList(e) {
        var id = e.currentTarget.dataset.id;
        if (this.data.order.line_items.length == 1) {
            wx.navigateTo({
                url: '/pages/order-review-post/order-review-post?id=' + id + '&itemID=' + this.data.order.line_items[0].id
            })

        } else {
            wx.navigateTo({
                url: '/pages/order-review-list/order-review-list?id=' + id
            })
        }
    },
    // 获取订单数据
    getOrderDetail() {
        var params = {
            w2w_session: app.data.w2w_session
        };
        if (this.options.paybyfriend_token) {
            params.paybyfriend_token = this.options.paybyfriend_token;
        }
        app.Util.network.GET({
            url: app.API('order') + this.options.id,
            params: params,
            success: data => {
                /* W2W Extension, Name: w2w-products-groupon, Code: grouponOrderHandle */
                if (data.groupon) {
                    if (this.wxTimer) {
                        this.wxTimer.stop();
                    }
                    var date1 = new Date(),
                        date2 = new Date(data.groupon.expire.replace(/\-/g, '/')),
                        diff = app.Util.diffTime(date1, date2);

                    if (date1.getTime() < date2.getTime()) {
                        this.wxTimer = new Timer({
                            beginTime: diff.hours + ':' + diff.minutes + ':' + diff.seconds,
                            days: diff.days,
                            showDay: false,
                            name: 'timerCountDown',
                            intervalFn: (i, timerObj) => {
                                this.setData({
                                    grouponCountDown: timerObj
                                });
                            }
                        })
                        this.wxTimer.start(this);
                    } else {
                        this.setData({
                            grouponCountDown: {
                                hours: '00',
                                minutes: '00',
                                seconds: '00'
                            }
                        });
                    }
                }
                /* W2W Extension, Name: w2w-products-groupon, Code: grouponOrderCountDown */

                this.setData({
                    order: data,
                    province: data.billing ? app.Util.getStateName(data.billing.state) || '' : ''
                }, () => {
                    if (this.options.externalPay == 'true') {
                        delete this.options.externalPay;
                        this.showCopyPayURL();
                    } else if (this.options.paybyfriend == 'true') {
                        delete this.options.paybyfriend;
                        this.showPayByFriendPopup();
                    }
                });
            }
        });
    },
    onLoad(options) {
        this.setData({
            currentPages: getCurrentPages().length,
            options: options
        });

        this.options = options;
        wx.hideShareMenu();
        this.checkLogin(() => {
            this.getOrderDetail();
        });

        app.isEnterOrderDetail = true; // 标识进入了订单详情页
    },
    onShow() {
        if (this.wxTimer) {
            this.wxTimer.calibration();
        }
    },
    onPullDownRefresh() {
        this.onLoad(this.options);
    },
    onShareAppMessage(e) {
        var type = e.target.dataset.type;

        if (type == 'paybyfriend') {
            return app.getShareInfo({
                title: '我看中了一件好货，快帮我付款吧~',
                path: '/pages/order-detail/order-detail',
                params: {
                    id: this.options.id,
                    paybyfriend_token: this.data.order.paybyfriend_token
                },
                imageUrl: this.data.order.line_items[0].image[0].single.url,
                appReportInviter: true
            });
        }
        /* W2W Extension, Name: w2w-products-groupon, Code: grouponOrderShare */
        else if (type == 'groupon') {
            return app.getShareInfo({
                title: '【仅剩' + this.data.order.groupon.member_remain + '人】快来拼' + this.data.order.groupon.product_name,
                path: '/pages/groupon-result/groupon-result',
                params: {
                    groupon_id: this.options.id
                },
                imageUrl: this.data.order.groupon.product_image,
            });
        }
        /* W2W Extension, Name: w2w-products-groupon, Code: grouponOrderShare */
    },
    onReachBottom() {

    }
}))