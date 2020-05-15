// pages/address-list/address-list.js

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
        /* W2W Extension, Name: w2w-advanced-address, Code: addressListData */
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '我的地址',
        isActionPopup: false,
        addressAuth: true, // 是否授权收货地址
        /* W2W Extension, Name: w2w-advanced-address, Code: addressListData */
    }),
    /* W2W Extension, Name: w2w-advanced-address, Code: addressListEvents */
    loginBack2: true,
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
        this.isChoosing = true;
        wx.chooseAddress({
            success: res => {
                console.log('获取收货地址成功', res);
                app.Util.network.POST({
                    url: app.API('address'),
                    params: {
                        billing_first_name: res.userName,
                        billing_phone: res.telNumber,
                        billing_country: 'CN',
                        billing_state: app.Util.getStateCode(res.provinceName),
                        billing_city: res.cityName,
                        billing_address_1: res.countyName + res.detailInfo,
                        billing_postcode: res.postalCode,
                        w2w_session: app.data.w2w_session
                    },
                    success: data => {
                        if (data.success == true) {
                            if (this.data.mode == 'select') {
                                app.data.address = data.addresses[0];
                                app.data.addressChange = true;
                                wx.setStorage({
                                    key: 'address',
                                    data: app.data.address,
                                    success: () => {
                                        wx.navigateBack();
                                    }
                                })
                            } else if (this.data.mode == 'manage') {
                                wx.showToast({
                                    title: '已导入',
                                    duration: 1000
                                });
                                this.formatAndSetAddresses(data.addresses);
                            }
                        } else {
                            this.showZanTopTips(data.errors);
                        }
                    }
                });
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
    // 打开操作弹窗
    openActionPopup(e) {
        var index = e.currentTarget.dataset.index;
        this.selectedAddress = index;
        wx.showActionSheet({
            itemList: ['编辑', '删除', '复制'],
            success: res => {
                if (res.tapIndex == 0) {
                    this.goEditAddress()
                } else if (res.tapIndex == 1) {
                    this.deleteAddress();
                } else if (res.tapIndex == 2) {
                    this.copyAddress();
                }
            }
        });
    },
    // 编辑地址
    goEditAddress() {
        var id = this.selectedAddress;
        wx.navigateTo({
            url: '/pages/address-edit/address-edit?mode=edit&id=' + id
        })
    },
    // 删除地址
    deleteAddress() {
        app.Util.network.POST({
            url: app.API('delete_address'),
            params: {
                id: this.selectedAddress,
                w2w_session: app.data.w2w_session
            },
            success: data => {
                if (data.success == true) {
                    wx.showToast({
                        title: '已删除',
                    })
                    this.formatAndSetAddresses(data.addresses);
                }
            }
        });
    },
    // 复制地址
    copyAddress() {
        var id = this.selectedAddress,
            address = this.data.addressList[id];
        var str = '收货人：' + address.billing_first_name + '\r\n' +
            '手机号码：' + address.billing_phone + '\r\n' +
            '我的地址：' + address.billing_country + address.billing_state + address.billing_city + address.billing_address_1 + '\r\n' +
            '邮政编码：' + address.billing_postcode;
        app.setClipboard(str);
    },
    goAddAddress() {
        wx.navigateTo({
            url: '/pages/address-edit/address-edit?mode=add'
        })
    },
    // 地址点击
    addressTap(e) {
        if (this.data.mode == 'select') {
            var index = e.currentTarget.dataset.index;
            app.data.address = this.data.ognAddresses[index];
            app.data.addressChange = true;
            wx.setStorage({
                key: 'address',
                data: app.data.address,
                success: () => {
                    wx.navigateBack();
                }
            })
        } else if (this.data.mode == 'manage') {
            this.openActionPopup(e);
        }
    },
    // 格式化并设置地址列表
    formatAndSetAddresses(addresses) {
        var ognAddresses = app.Util.cloneObj(addresses);
        for (var i in addresses) {
            addresses[i] = app.Util.addressTransform(addresses[i], 'show');
        }
        this.setData({
            ognAddresses: ognAddresses,
            addressList: addresses
        });
    },
    load() {
        app.Util.network.GET({
            url: app.API('address'),
            params: {
                w2w_session: app.data.w2w_session
            },
            success: data => {
                this.formatAndSetAddresses(data.addresses);
            }
        });
    },
    onLoad(options) {
        this.setData({
            mode: options.mode,
            currentPages: getCurrentPages().length
        });

        if (!app.isLoggedIn()) {
            this.checkLogin(() => {
                this.load();
            });
        }
    },
    onShow() {
        if (this.isChoosing == true) {
            delete this.isChoosing;
            return;
        }
        if (app.isLoggedIn()) {
            this.load();
        }
    },
    onPullDownRefresh() {
        this.onShow();
    }
    /* W2W Extension, Name: w2w-advanced-address, Code: addressListEvents */
}))