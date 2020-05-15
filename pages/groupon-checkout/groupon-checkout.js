// pages/groupon-checkout/groupon-checkout.js

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
        /* W2W Extension, Name: w2w-products-groupon, Code: grouponCheckoutData */
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '结算',
        currency: app.data.currency,
        address: null,
        cart: null,
        isShippingPopup: false,
        shipping: null,
        addressAuth: true, // 是否授权收货地址
        /* W2W Extension, Name: w2w-products-groupon, Code: grouponCheckoutData */
    }),
    /* W2W Extension, Name: w2w-products-groupon, Code: grouponCheckoutEvents */
    // 检查配送方式
    checkShipping() {
        if ((this.data.addressType == 'wx' && (!app.data.address || !app.data.address.userName)) ||
            (this.data.addressType != 'wx' && (!app.data.address || !app.data.address.billing_first_name))) {
            wx.showToast({
                icon: 'none',
                title: '请先选择收货地址',
            })
            return false;
        } else if (this.data.cart.needs_shipping === true && this.data.shipping.methods.length == 0) {
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
        if (this.data.cart.needs_shipping === false) {
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
        var address_param = app.getAddressParam();
        var params = {
            w2w_session: app.data.w2w_session,
            action: 'get_shipping_methods',
        };
        if (this.options.product_id) {
            params.product_id = this.options.product_id;
        } else if (this.options.groupon_id) {
            params.groupon_id = this.options.groupon_id;
        }
        app.Util.network.GET({
            url: app.API('groupon_checkout'),
            params: Object.assign({},
                address_param, params
            ),
            success: data => {
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

        var params = {
            w2w_session: app.data.w2w_session,
            action: 'set_shipping_method',
            shipping_method: method
        };
        if (this.options.product_id) {
            params.product_id = this.options.product_id;
        } else if (this.options.groupon_id) {
            params.groupon_id = this.options.groupon_id;
        }
        app.Util.network.POST({
            url: app.API('groupon_checkout'),
            params: params,
            success: data => {
                app.data.shipping = data.shipping;
                app.data.payment = data.payment;
                this.setData(data);
            }
        });
    },
    // 选择支付方式
    paymentChange(e) {
        var payment = e.currentTarget.dataset.id;
        var params = {
            w2w_session: app.data.w2w_session,
            action: 'set_payment_method',
            payment_method: payment
        };
        if (this.options.product_id) {
            params.product_id = this.options.product_id;
        } else if (this.options.groupon_id) {
            params.groupon_id = this.options.groupon_id;
        }
        app.Util.network.POST({
            url: app.API('groupon_checkout'),
            params: params,
            success: data => {
                app.data.payment = data.payment;
                this.setData(data);
            }
        });
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
        if (this.data.cart.cart_contents_count == 0) return;

        var addressParam = app.getOrderAddressParam(),
            params = Object.assign({},
                addressParam, {
                    w2w_session: app.data.w2w_session,
                    order_comments: this.form && this.form.comment ? this.form.comment : '',
                    //form_id: e.detail.formId,
                    terms: true,
                    _wpnonce: this.data.cart._wpnonce,
                }
            );
        if (this.options.product_id) {
            params.product_id = this.options.product_id;
        } else if (this.options.groupon_id) {
            params.groupon_id = this.options.groupon_id;
        }

        if (this.data.shipping.chosen_method != '') {
            params.shipping_method = this.data.shipping.chosen_method;
        }
        if (this.data.payment.chosen_method != '') {
            params.payment_method = this.data.payment.chosen_method;
        }

        app.Util.network.POST({
            url: app.API('groupon_order'),
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
                                                url: '/pages/groupon-result/groupon-result?groupon_id=' + (this.options.groupon_id ? this.options.groupon_id : orderID),
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
                            paybyfriend = true
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
    // 跳转地址选择
    goAddressList() {
        wx.navigateTo({
            url: '/pages/address-list/address-list?mode=select'
        })
    },
    load() {
        var data = {
            addressType: app.data.addressType || 'wx'
        };
        if (app.data.address != null) {
            data.address = app.data.address;
        }
        if (app.data.shipping != null) {
            data.shipping = app.data.shipping;
        }
        if (app.data.payment != null) {
            data.payment = app.data.payment;
        }
        this.setData(data);
    },
    onLoad(options) {
        this.setData({
            currentPages: getCurrentPages().length
        });

        this.options = options;
        this.load();
        this.getShippingMethods();
    },
    onShow() {
        this.load();
        if (app.data.addressChange === true) {
            this.getShippingMethods();
            app.data.addressChange = false;
        }
    },
    onPullDownRefresh() {
        this.onLoad(this.options);
    },
    /* W2W Extension, Name: w2w-products-groupon, Code: grouponCheckoutEvents */
}))