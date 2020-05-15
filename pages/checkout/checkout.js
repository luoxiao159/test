// pages/checkout/checkout.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const Zan = require('../../vendor/ZanUI/index');
const app = getApp();

Page(Object.assign({}, Zan.TopTips, app.Methods, {
    data: Object.assign({}, app.Variables, {
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '结算',
        currency: app.data.currency,
        /* W2W Extension, Name: w2w-advanced-coupon, Code: couponSelectMode */
        couponMode: 'advanced',
        /* W2W Extension, Name: w2w-advanced-coupon, Code: couponSelectMode */
        address: null,
        cart: null,
        isShippingPopup: false,
        shipping: null,
        coupons: null,
        addressAuth: true, // 是否授权收货地址
    }),
    /* W2W Extension, Name: w2w-points-and-rewards, Code: pointsEvents */

/* W2W Extension, Name: w2w-points-and-rewards, Code: pointsEvents */
    // 检查配送方式
    checkShipping() {
        if ((this.data.addressType == 'wx' && (!app.data.address || !app.data.address.userName)) ||
            (this.data.addressType != 'wx' && (!app.data.address || !app.data.address.billing_first_name))) {
            wx.showToast({
                icon: 'none',
                title: '请先选择收货地址',
            })
            return false;
        } else if (app.data.cart.needs_shipping === true && app.data.shipping.methods.length == 0) {
            wx.showToast({
                icon: 'none',
                title: '当前地址暂无可用配送方式',
            })
            return false;
        }
        return true;
    },
    // 打开配送方式弹窗
    openShippingPopup() {
        /*if (this.data.cart.errors.length > 0) {
            this.showZanTopTips(this.data.cart.errors);
            return;
        }*/

        if (app.data.cart.needs_shipping === false) {
            wx.showToast({
                icon: 'none',
                title: '当前订单无需物流',
            })
        } else {
            if (this.checkShipping()) {
                this.setData({
                    isShippingPopup: true
                });
            }
        }
    },
    // 关闭配送方式弹窗
    closeShippingPopup() {
        this.setData({
            isShippingPopup: false
        });
    },
    // 新版 - 按钮打开设置页回调
    openSetting(e) {
        if (e.detail.authSetting['scope.address'] == true) {
            this.setData({
                addressAuth: true
            });
            this.selectAddressSuccess();
        }
    },
    // 选择收货地址成功
    selectAddressSuccess() {
        wx.chooseAddress({
            success: res => {
                console.log('获取收货地址成功', res);
                app.data.address = res;
                this.setData({
                    address: res
                });
                wx.setStorage({
                    key: 'address',
                    data: res
                })

                this.getShippingMethods();
            },
            fail: res => {
                if (res.errMsg == 'chooseAddress:fail auth deny' || res.errMsg == 'chooseAddress:fail:auth denied') {
                    this.setData({
                        addressAuth: false
                    }); // 为新版做准备
                }
            }
        })
    },
    // 获取配送方式
    getShippingMethods() {
        var params = Object.assign({}, this.buyNowParams, app.getAddressParam(), {
            w2w_session: app.data.w2w_session
        });
        this.buyNowParams = this.buyNow ? {
            buynow: true
        } : {};

        /* W2W Extension, Name: w2w-points-and-rewards, Code: getShippingMethodParams */

/* W2W Extension, Name: w2w-points-and-rewards, Code: getShippingMethodParams */

        app.Util.network.GET({
            url: app.API('shipping_method'),
            params: params,
            success: data => {
                app.updateCart(data.cart);
                app.data.coupons = data.coupons;
                app.data.shipping = data.shipping;
                app.data.payment = data.payment;
                this.setData(data);
                if (data.cart.errors.length > 0) {
                    this.showZanTopTips(data.cart.errors);
                }
            }
        });
    },
    // 选择配送方式
    shippingChange(e) {
        var method = e.currentTarget.dataset.id;
        this.closeShippingPopup();

        var params = Object.assign({}, this.buyNowParams, {
            w2w_session: app.data.w2w_session,
            shipping_method: method
        });

        /* W2W Extension, Name: w2w-points-and-rewards, Code: setShippingMethodParams */

/* W2W Extension, Name: w2w-points-and-rewards, Code: setShippingMethodParams */

        app.Util.network.POST({
            url: app.API('shipping_method'),
            params: params,
            success: data => {
                app.updateCart(data.cart);
                app.data.shipping = data.shipping;
                app.data.payment = data.payment;
                this.setData(data);
            }
        });
    },
    // 选择支付方式
    paymentChange(e) {
        /*if (this.data.cart.errors.length > 0) {
            this.showZanTopTips(this.data.cart.errors);
            return;
        }*/

        var payment = e.currentTarget.dataset.id;
        var params = Object.assign({}, this.buyNowParams, {
            w2w_session: app.data.w2w_session,
            payment_method: payment
        })

        /* W2W Extension, Name: w2w-points-and-rewards, Code: setPaymentMethodParams */

/* W2W Extension, Name: w2w-points-and-rewards, Code: setPaymentMethodParams */

        app.Util.network.POST({
            url: app.API('payment_method'),
            params: params,
            success: data => {
                app.data.payment = data.payment;
                this.setData(data);
            }
        });
    },
    goCoupon() {
        /*if (this.data.cart.errors.length > 0) {
            this.showZanTopTips(this.data.cart.errors);
            return;
        }*/

        if (this.data.cart.coupons_enabled) {
            app.buyNowParams = this.buyNowParams;
            if (this.data.couponMode == 'advanced') {
                wx.navigateTo({
                    url: '/pages/my-coupon/my-coupon?mode=select'
                })
            } else {
                wx.navigateTo({
                    url: '/pages/coupon/coupon'
                })
            }
        } else {
            wx.showToast({
                icon: 'none',
                title: '暂不支持优惠券'
            })
        }
    },
    // 提交订单
    goSubmitOrder(e) {
        if (this.data.cart.errors.length > 0) {
            this.showZanTopTips(this.data.cart.errors);
            return;
        }
        if (!this.checkShipping()) return;
        if (this.data.payment.chosen_method === false) {
            wx.showToast({
                icon: 'none',
                title: '暂无可用支付方式'
            })
            return;
        }
        if (app.data.cart.cart_contents_count == 0) return;

        var order_param = app.getOrderParam(),
            params = Object.assign({},
                order_param, {
                    w2w_session: app.data.w2w_session,
                    order_comments: this.form && this.form.comment ? this.form.comment : '',
                    //form_id: e.detail.formId
                }
            );

        if (this.data.shipping.chosen_method != '') {
            params.shipping_method = this.data.shipping.chosen_method;
        }
        if (this.data.payment.chosen_method != '') {
            params.payment_method = this.data.payment.chosen_method;
        }

        // 立即购买参数
        params = Object.assign({}, this.buyNowParams, params);

        /* W2W Extension, Name: w2w-points-and-rewards, Code: orderParams */

/* W2W Extension, Name: w2w-points-and-rewards, Code: orderParams */

        app.Util.network.POST({
            url: app.API('orders'),
            params: params,
            success: data => {
                console.log('提交订单', data);

                // 订单提交成功
                if (data.result == 'success') {

                    // 需要在线支付
                    if (data.order) {
                        var orderID = data.order.id;

                        // 发起支付
                        app.requestPayment({
                            id: orderID,
                            success: res => {
                                wx.showToast({
                                    title: '已支付',
                                    success: () => {
                                        setTimeout(() => {
                                            wx.redirectTo({
                                                url: '/pages/order-detail/order-detail?id=' + orderID + '&status=success',
                                            })
                                        }, 1500);
                                    }
                                });
                            },
                            fail: res => {
                                if (res.errMsg == 'requestPayment:fail cancel') {
                                    wx.redirectTo({
                                        url: '/pages/order-detail/order-detail?id=' + orderID + '&status=cancel',
                                    })
                                } else {
                                    var msg = res.err_code_des || '支付暂时出现问题，请稍候再试';
                                    wx.showToast({
                                        icon: 'none',
                                        title: msg,
                                        success: () => {
                                            setTimeout(() => {
                                                wx.redirectTo({
                                                    url: '/pages/order-detail/order-detail?id=' + orderID + '&status=fail',
                                                })
                                            }, 1500);
                                        }
                                    });
                                }
                            },
                            complete: res => {
                                this.emptyCheckoutData();
                            }
                        });
                    }
                    // 不需在线支付
                    else {
                        var orderID, externalPay, paybyfriend;
                        var redirect = data.redirect,
                            exp = /order\-received\/(\d+)\/\?key\=/g,
                            result = exp.exec(redirect);
                        // 离线支付方式
                        if (result != null) {
                            orderID = result[1];
                        }
                        // 好友代付
                        else if (data.paybyfriend) {
                            orderID = data.order_id;
                            paybyfriend = true;
                        }
                        // 需要到浏览器完成支付
                        else if (data.order_id) {
                            orderID = data.order_id;
                            externalPay = true;
                        }
                        if (!orderID) {
                            this.showZanTopTips(['提交失败，请稍候再试']);
                            return;
                        }
                        wx.showToast({
                            title: '订单提交成功',
                            success: () => {
                                setTimeout(() => {
                                    wx.redirectTo({
                                        url: '/pages/order-detail/order-detail?id=' + orderID + '&status=success' + (externalPay ? '&externalPay=true' : '') + (paybyfriend ? '&paybyfriend=true' : ''),
                                    })
                                }, 1500);
                            }
                        });
                    }
                }
                // 订单提交失败
                else if (data.result == 'failure') {
                    if (data.messages) {
                        var exp = /\<li\>([\s\S]*?)\<\/li\>/ig,
                            result,
                            errors = [];
                        while ((result = exp.exec(data.messages)) != null) {
                            errors.push(app.Util.stripHTML(result[1].trim()));
                        }
                        this.showZanTopTips(errors);
                    } else {
                        this.showZanTopTips(['提交失败，请稍候再试']);
                    }
                }
            }
        });
    },
    // 清空结算数据
    emptyCheckoutData() {
        app.updateCart({
            cart: null,
            cart_contents_count: 0
        });
        //app.shipping = null;
        app.data.coupons = [];

        //this.load();
    },
    // 跳转地址选择
    goAddressList() {
        wx.navigateTo({
            url: '/pages/address-list/address-list?mode=select'
        })
    },
    load() {
        var data = {
            coupons: app.data.coupons,
            addressType: app.data.addressType || 'wx'
        };
        if (app.data.cart) {
            data.cart = app.data.cart;
        }
        if (app.data.address) {
            data.address = app.data.address;
        }
        if (app.data.shipping) {
            data.shipping = app.data.shipping;
        }
        if (app.data.payment) {
            data.payment = app.data.payment;
        }
        this.setData(data);
    },
    onLoad(options) {
        this.load();

        // 立即购买参数
        if (app.buyNowParams) {
            this.buyNow = true;
            this.buyNowParams = app.buyNowParams || {};
            delete app.buyNowParams;
        } else {
            this.buyNowParams = {};
        }

        this.getShippingMethods();
    },
    onShow() {
        this.setData({
            currentPages: getCurrentPages().length
        });

        this.load();
        if (app.data.addressChange === true) {
            this.getShippingMethods();
            app.data.addressChange = false;
        }
    },
    onReady() {
        if (app.checkVirtual() && wx.IS_IOS) {
            wx.showModal({
                title: '提示',
                content: 'IOS暂不支持虚拟物品的支付，请到安卓端完成支付',
                showCancel: false,
                confirmColor: this.data.mainColor,
                success: res => {
                    wx.navigateBack();
                }
            })
            return;
        }
    },
    onPullDownRefresh() {
        this.load();
        this.getShippingMethods();
    },
}))