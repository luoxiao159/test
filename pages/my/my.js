// pages/my.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const app = getApp();

Page(Object.assign({}, app.Methods, {
    data: Object.assign({}, app.Variables, {
        appName: app.data.name,
        pageTitle: '我的',
        userInfo: null,
        blurClass: 'blur-android',
        businessTools: [{
            id: 'verification',
            title: '扫码核销',
        }]
    }),
    goOrderList(e) {
        var dataset = e.currentTarget.dataset,
            status = 'all';
        if (dataset.status != undefined) {
            status = dataset.status;
        }

        wx.navigateTo({
            url: '/pages/order-list/order-list?status=' + status,
        })
    },
    goMyCoupon() {
        wx.navigateTo({
            url: '/pages/my-coupon/my-coupon?mode=view',
        })
    },
    goMyPoints() {
        wx.navigateTo({
            url: '/pages/points-info/points-info',
        })
    },
    goMyDistribution() {
        wx.navigateTo({
            url: '/pages/distribution-info/distribution-info',
        })
    },
    goMyGroupon() {
        wx.navigateTo({
            url: '/pages/groupon-order-list/groupon-order-list',
        })
    },
    goMyFavour() {
        this.checkLogin(() => {
            wx.navigateTo({
                url: '/pages/product-list/product-list?favor=true',
            })
        })
    },
    goAddressList() {
        wx.navigateTo({
            url: '/pages/address-list/address-list?mode=manage',
        })
    },
    clearCache() {
        app.logout(false);
        this.setData({
            memberInfo: null,
            userInfo: null
        });
        app.checkLogin();
        wx.showToast({
            title: '已清除',
        })
    },
    goAbout() {
        wx.navigateTo({
            url: '/pages/about/about',
        })
    },
    /* W2W Extension, Name: w2w-scan-to-login, Code: scanQRCode */
    // 扫码登录网站
    scanQRCode() {
        this.checkLogin(() => {
            wx.scanCode({
                onlyFromCamera: true,
                scanType: ['qrCode'],
                success: res => {
                    var qrcode = res.result;
                    if (qrcode.length != 16) {
                        wx.showToast({
                            icon: 'none',
                            title: '无效的二维码'
                        })
                        return;
                    }
                    app.Util.network.POST({
                        url: app.API('scanqrcode'),
                        params: {
                            w2w_session: app.data.w2w_session,
                            qrcode: qrcode,
                            action: 'scan'
                        },
                        success: (data) => {
                            if (data.success == true) {
                                wx.showModal({
                                    title: '请确认',
                                    content: '确认使用' + app.data.userInfo.nickName + '的账号登录网站？',
                                    confirmColor: this.data.mainColor,
                                    confirmText: '确认登录',
                                    success: res => {
                                        if (res.confirm) {
                                            app.Util.network.POST({
                                                url: app.API('scanqrcode'),
                                                params: {
                                                    w2w_session: app.data.w2w_session,
                                                    qrcode: qrcode,
                                                    action: 'confirm'
                                                },
                                                success: (data) => {
                                                    if (data.success == true) {
                                                        wx.showToast({
                                                            title: '已登录'
                                                        })
                                                    }
                                                },
                                                loadingTitle: '正在登录'
                                            });
                                        }
                                    }
                                })
                            }
                        }
                    });
                }
            })
        });
    },
    /* W2W Extension, Name: w2w-scan-to-login, Code: scanQRCode */
    loginSuccess() {
        app.refreshMemberInfo(data => {
            this.setData({
                memberInfo: data
            });
        });
    },
    onLoad(options) {
        //var blurClass = wx.IS_ANDROID ? 'blur-android' : 'blur-ios'
        this.setData({
            //blurClass: blurClass,
            orderStatuses: app.Util.getOrderStatusObj()
        });
    },
    onShow() {
        this.setData({
            userInfo: app.data.userInfo
        });
        app.checkLogin({
            success: () => {
                app.refreshMemberInfo(data => {
                    this.setData({
                        memberInfo: data
                    });
                });
            },
            fail: () => {
                wx.stopPullDownRefresh()
            }
        });
    },
    onPullDownRefresh() {
        this.onShow();
    },
    onReachBottom() {

    }
}))