// pages/my-coupon/my-coupon.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const Zan = require('../../vendor/ZanUI/index');
const app = getApp();

Page(Object.assign({}, Zan.Tab, app.Methods, {
    data: Object.assign({}, app.Variables, {
        /* W2W Extension, Name: w2w-advanced-coupon, Code: myCouponData */
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '我的优惠券',
        currency: app.data.currency,
        btnEnabled: false,
        coupons: null,
        coupon_input: '',
        tabSelected: 'notused',
        tabList: [{
                id: 'notused',
                title: '未使用'
            },
            {
                id: 'used',
                title: '已使用'
            },
            {
                id: 'expired',
                title: '已过期'
            }
        ]
        /* W2W Extension, Name: w2w-advanced-coupon, Code: myCouponData */
    }),
    /* W2W Extension, Name: w2w-advanced-coupon, Code: myCouponEvents */
    loginBack2: true,
    couponInput(e) {
        this.setData({
            btnEnabled: e.detail.value.length > 0
        });
    },
    // 状态切换
    handleZanTabChange({
        componentId,
        selectedId
    }) {
        if (componentId == 'order-tab') {
            this.setData({
                tabSelected: selectedId
            });
        }
    },
    // 添加优惠券
    couponSubmit(e) {
        var coupon = '';
        // 表单提交
        if (typeof e.detail.value == 'object') {
            coupon = e.detail.value.coupon;
        }
        // 输入框完成提交
        else {
            coupon = e.detail.value;
        }
        if (coupon == '') return;

        var params = {
            w2w_session: app.data.w2w_session,
            return_all: true,
            code: coupon
        };
        if (this.options.mode == 'select') {
            params.cart_coupons = true;
        }
        // 立即购买参数
        params = Object.assign({}, this.buyNowParams, params);
        app.Util.network.POST({
            url: app.API('my_coupon'),
            params: params,
            success: data => {
                wx.showToast({
                    title: '已领取'
                })
                this.handleCoupons(data);
            },
            fail: data => {
                wx.showToast({
                    icon: 'none',
                    title: data.message
                });
            },
            complete: () => {
                this.setData({
                    btnEnabled: false,
                    coupon_input: ''
                });
            }
        });
    },
    // 优惠券说明展开折叠
    expandSwitch(e) {
        var code = e.currentTarget.dataset.code,
            oldExpanded = this.data.expandedCoupons == undefined ? undefined : this.data.expandedCoupons[code],
            expanded = oldExpanded == undefined || oldExpanded == false;
        var empty = true,
            expandedCoupons = this.data.expandedCoupons || {};
        expandedCoupons[code] = expanded;
        for (var i in expandedCoupons) {
            if (expandedCoupons[i] !== false) {
                empty = false;
            }
        }
        this.setData({
            expandedCoupons: (empty ? {} : expandedCoupons)
        });
    },
    // 去使用（查看可用券产品）
    goToUse(e) {
        var code = e.currentTarget.dataset.code;
        wx.navigateTo({
            url: '/pages/product-list/product-list?coupon=' + code
        })
    },
    // 优惠券点击
    couponTap(e) {
        var dataset = e.currentTarget.dataset,
            index = dataset.index,
            code = dataset.code;

        if (this.data.coupons.notused[index].applied) {
            this.removeCoupon(code);
        } else {
            this.applyCoupon(code, () => {
                wx.navigateBack();
            });
        }
    },
    // 应用优惠券
    applyCoupon(coupon, callback = () => {}) {
        app.Util.network.POST({
            url: app.API('cart_coupon'),
            params: Object.assign({}, this.buyNowParams, {
                w2w_session: app.data.w2w_session,
                coupon_code: coupon
            }),
            success: data => {
                var toast = {};
                toast.title = data.success ? data.success : data.error;
                toast.icon = 'none';
                wx.showToast(toast);

                app.updateCart(data.cart);
                app.data.shipping = data.shipping;
                app.data.coupons = data.coupons;

                this.handleCoupons(data.coupons);
                if (data.success) {
                    callback();
                }
            }
        });
    },
    // 移除优惠券
    removeCoupon(coupon) {
        app.Util.network.POST({
            url: app.API('remove_coupon'),
            params: Object.assign({}, this.buyNowParams, {
                w2w_session: app.data.w2w_session,
                coupon_code: coupon
            }),
            success: data => {
                var toast = {};
                toast.title = data.success ? data.success : data.error;
                toast.icon = 'none';
                wx.showToast(toast);

                app.updateCart(data.cart);
                app.data.shipping = data.shipping;
                app.data.coupons = data.coupons;

                this.handleCoupons(data.coupons);
            }
        });
    },
    // 处理请求获取的优惠券
    handleCoupons(coupons) {
        var notused_count = coupons.notused != undefined ? coupons.notused.length : 0,
            used_count = coupons.used != undefined ? coupons.used.length : 0,
            expired_count = coupons.expired != undefined ? coupons.expired.length : 0,
            data = {
                coupons: coupons
            };
        if (notused_count > 0) {
            data['tabList[0].title'] = '未使用(' + notused_count + ')';
        }
        if (used_count > 0) {
            data['tabList[1].title'] = '已使用(' + used_count + ')';
        }
        if (expired_count > 0) {
            data['tabList[2].title'] = '已过期(' + expired_count + ')';
        }
        for (var status in coupons) {
            for (var i in coupons[status]) {
                if (app.Util.getStrLength(coupons[status][i].instruction) > 40) {
                    coupons[status][i].showExpandBtn = true;
                }
            }
        }
        this.setData(data);
    },
    load() {
        var params = {
            w2w_session: app.data.w2w_session
        };
        if (this.options.mode == 'select') {
            params.cart_coupons = true;
        }
        // 立即购买参数
        params = Object.assign({}, this.buyNowParams, params);
        app.Util.network.GET({
            url: app.API('my_coupon'),
            params: params,
            success: data => {
                if (this.data.mode == 'select') {
                    app.data.coupons = data;
                }
                this.handleCoupons(data);
            }
        });
    },
    onLoad(options) {
        this.options = options;
        this.setData({
            mode: options.mode,
            currentPages: getCurrentPages().length
        });

        this.buyNowParams = app.buyNowParams || {};
        if (app.buyNowParams) delete app.buyNowParams;

        this.checkLogin(() => {
            this.load();
        });
    },
    onShow() {

    },
    onPullDownRefresh() {
        this.load();
    },
    onReachBottom() {

    }
    /* W2W Extension, Name: w2w-advanced-coupon, Code: myCouponEvents */
}))