// pages/utils/methods.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

var Methods = {
    // 设置标题
    setPageTitle(title) {
        this.setData({
            pageTitle: title
        });
    },
    // 返回按钮点击
    backBtnTap() {
        if (this.data.currentPages != undefined && this.data.currentPages > 1) {
            wx.navigateBack();
        } else {
            wx.switchTab({
                url: '/pages/index/index'
            })
        }
    },
    // 链接点击
    linkTap(e) {
        var app = getApp();
        var url = e.currentTarget.dataset.url;
        app.handleLinkClick(url, this);
    },
    // 检查登录
    checkLogin(callback = function() {}) {
        var app = getApp();
        app.checkLogin({
            success: () => {
                callback();
            },
            fail: () => {
                // 首先尝试一次获取用户信息登录，失败后再显示登录按钮
                app.getUserInfo({
                    success: () => {
                        callback();
                    },
                    fail: () => {
                        /* 旧版登录 */
                        /*this.openLoginPopup();
                        this._loginSuccess = callback;*/
                        /* 旧版登录 */
                        app.beforeLoginPage = this;
                        this._loginSuccess = callback;
                        wx.navigateTo({
                            url: '/pages/login/login' + (this.loginBack2 ? '?back2=1' : ''),
                        })
                    }
                });
            }
        });
    },
    // 获取用户信息
    getUserInfo(e) {
        var app = getApp();
        app.buttonGetUserInfo(e, {
            success: data => {
                this.setData({
                    userInfo: data.userInfo
                });
                /* 旧版登录 setTimeout(() => { */
                if (typeof(this.loginSuccess) == 'function') {
                    this.loginSuccess(data);
                }
                if (typeof(this._loginSuccess) == 'function') {
                    this._loginSuccess();
                    delete this._loginSuccess;
                }
                this.closeLoginPopup();
                /* 旧版登录 }, 1500); */
            },
            fail: () => {
                this.closeLoginPopup();
                delete this._loginSuccess;
            }
        });
    },
    // 关闭登录弹窗
    closeLoginPopup() {
        this.setData({
            isLoginPopup: false
        });
        if (typeof(this._loginSuccess) == 'function') {
            delete this._loginSuccess;
        }
    },
    // 打开登录弹窗
    openLoginPopup() {
        this.setData({
            isLoginPopup: true
        });
    },
    // 添加购物车
    doAddToCart(e, callback = function() {}, newPage = true) {
        var app = getApp(),
            dataset = e.currentTarget.dataset,
            product_id = dataset.id,
            product_type = dataset.type,
            product_name = dataset.name,
            in_stock = dataset.inStock,
            url = '/pages/product-detail/product-detail?id=' + product_id + '&name=' + encodeURIComponent(product_name) + '&popup=true';

        if (product_type == 'variable') {
            if (newPage) {
                wx.navigateTo({
                    url: url
                })
            } else {
                wx.redirectTo({
                    url: url
                })
            }
        } else {
            this.checkLogin(() => {
                var params = {
                    product_id: product_id,
                    quantity: 1,
                    w2w_session: app.data.w2w_session,
                };
                app.Util.network.POST({
                    url: app.API('add_to_cart'),
                    params: params,
                    success: data => {
                        if (data.errors.length > 0) {
                            this.showZanTopTips(data.errors);
                        } else {
                            wx.showToast({
                                title: '已添加'
                            })
                        }
                        app.updateCart(data);
                        callback(data);
                    }
                });
            });
        }
    },
    // 跳转首页
    goIndex() {
        wx.switchTab({
            url: '/pages/index/index'
        })
    },
    // 复制文字
    copyText(e) {
        var app = getApp();
        var copy = e.currentTarget.dataset.copy;
        app.setClipboard(copy);
    },
    // 链接点击
    tagATap(e) {
        var app = getApp();
        var src = e.detail.src;
        app.handleLinkClick(src);
    },
    // 输入框失焦
    inputBlur(e) {
        if (!this.form) {
            this.form = {};
        }
        var name = e.currentTarget.dataset.name;
        this.form[name] = e.detail.value;
    },
    /* W2W Extension, Name: w2w-advanced-coupon, Code: receiveCouponEvent */
    receiveCoupon(e) {
        var code = e.currentTarget.dataset.code || e.detail.code;
        this.receiveCouponRequest(code);
    },
    receiveCouponRequest(code, callback = false) {
        var app = getApp();
        this.checkLogin(() => {
            app.Util.network.POST({
                url: app.API('my_coupon'),
                params: {
                    w2w_session: app.data.w2w_session,
                    code: code
                },
                success: data => {
                    if (callback) {
                        callback(data);
                    } else {
                        wx.showToast({
                            icon: 'none',
                            title: '已领取！快去使用吧~'
                        })
                    }
                },
                fail: data => {
                    wx.showModal({
                        title: '提示',
                        content: data.message,
                        showCancel: false,
                        confirmColor: app.data.mainColor,
                    });
                }
            });
        });
    },
    /* W2W Extension, Name: w2w-advanced-coupon, Code: receiveCouponEvent */
    /* W2W Extension, Name: w2w-products-distribution, Code: reportInviter */

/* W2W Extension, Name: w2w-products-distribution, Code: reportInviter */
    onShareAppMessage() {
        var app = getApp();
        return app.getShareInfo();
    },
    preventTouchMove() {

    }
}

module.exports = Methods;