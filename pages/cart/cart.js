// pages/cart/cart.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const Zan = require('../../vendor/ZanUI/index');
const app = getApp();

Page(Object.assign({}, Zan.Stepper, Zan.TopTips, app.Methods, {
    data: Object.assign({}, app.Variables, {
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '购物车',
        currency: app.data.currency,
        cart: null,
        _isLoginPopup: false,
    }),
    // 数量选择 更新购物车
    handleZanStepperChange(e) {
        var componentId = e.componentId,
            stepper = e.stepper,
            params = {
                w2w_session: app.data.w2w_session,
                cart_key: componentId,
            },
            url;

        if (stepper == 0) {
            url = app.API('delete_cart');
        } else {
            url = app.API('update_cart');
            params.quantity = stepper;
        }

        app.Util.network.POST({
            url: url,
            params: params,
            success: data => {
                app.updateCart(data);
                this.setData({
                    cart: data
                });
                if (data.errors.length > 0) {
                    this.showZanTopTips(data.errors);
                }
                this.handleCrossSells(data);
            }
        });
    },
    // 删除购物车项
    deleteCartItem(e) {

        var cart_key = e.currentTarget.dataset.cartKey;

        app.Util.network.POST({
            url: app.API('delete_cart'),
            params: {
                w2w_session: app.data.w2w_session,
                cart_key: cart_key
            },
            success: data => {
                wx.showToast({
                    title: '已删除',
                    duration: 1500
                });
                app.updateCart(data);
                this.setData({
                    cart: data
                });
                if (data.errors.length > 0) {
                    this.showZanTopTips(data.errors);
                }
                this.handleCrossSells(data);
            }
        });
    },
    handleCrossSells(cart) {
        // 获取交叉销售产品
        if (cart.cross_sells.length > 0) {
            var cross_sells = {};
            for (var i in cart.cross_sells) {
                cross_sells['include[' + i + ']'] = cart.cross_sells[i];
            }
            app.Util.network.GET({
                url: app.API('products'),
                params: Object.assign({},
                    cross_sells, {
                        orderby: 'include',
                        per_page: cart.cross_sells.length
                    }
                ),
                showLoading: false,
                success: data => {
                    this.setData({
                        cross_sells_products: data
                    });
                }
            });
        } else {
            this.setData({
                cross_sells_products: []
            });
        }
    },
    // 登录成功
    loginSuccess(data) {
        this.setData({
            cart: data.cart,
            _isLoginPopup: false
        });
        if (data.cart.errors.length > 0) {
            this.showZanTopTips(data.cart.errors);
        }
        app.refreshMemberInfo();
    },
    // 结算
    goCheckout() {
        if (app.checkVirtual() && wx.IS_IOS) {
            wx.showModal({
                title: '提示',
                content: 'IOS暂不支持虚拟物品的支付，请到安卓端完成支付',
                showCancel: false,
                confirmColor: this.data.mainColor,
            })
            return;
        } else {
            wx.navigateTo({
                url: '/pages/checkout/checkout'
            })
        }
    },
    addToCart(e) {
        this.doAddToCart(e, cart => {
            this.setData({
                cart: app.data.cart
            });
        });
    },
    goProductDetail(e) {
        app.goProductDetail(e);
    },
    // 随便逛逛
    goShopping() {
        wx.navigateTo({
            url: '/pages/product-list/product-list'
        })
    },
    load() {
        app.refreshCart((cart) => {
            this.setData({
                cart: cart,
                _isLoginPopup: false
            });
            if (cart.errors.length > 0) {
                this.showZanTopTips(cart.errors);
            }
            this.handleCrossSells(cart);
        });
    },
    onLoad(options) {
        app.checkLogin({
            success: () => {
                this.load();
            },
            fail: () => {
                this.setData({
                    _isLoginPopup: true
                });
            }
        });
    },
    onShow() {
        /*if (app.data.cart != null) {
        	wx.showLoading({
        		title: '正在加载',
        		mask: true
        	})
        	this.setData({
        		cart: app.data.cart
        	}, () => {
        		wx.hideLoading();
        	});
        	app.updateCart(app.data.cart);
        	if (app.data.cart.errors.length > 0) {
        		this.showZanTopTips(app.data.cart.errors);
        	}
        }
        else {
        	this.onPullDownRefresh();
        }*/
        /*if (app.data.cart) {
            this.setData({
                cart: app.data.cart
            });
        }*/
        if (app.isLoggedIn()) {
            this.load();
        }
    },
    onPullDownRefresh() {
        this.load();
    },
    onReachBottom() {

    }
}))