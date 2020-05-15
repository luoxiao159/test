// app.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

var system = require('utils/system.js');

App({
    data: {
        version: '2.7',
        versionDate: '20200229',
        siteURL: 'http://benc.cc/', // 请填写WordPress设置 - 常规中的站点地址
        //siteURL: 'http://localhost/wordpress/', // 请填写WordPress设置 - 常规中的站点地址
        name: '聚录鼎科技', // 小程序名称，用于顶部标题栏、我的页关于按钮
        logo: '/images/woo-logo.png', // 小程序LOGO，用于关于、登录页面、官方回复中的头像
        lazyLoadLogo: '/images/woo-logo-lazy-loading.svg', // 懒加载图片显示的LOGO
        shareCover: '/images/share-cover.png', // 小程序分享默认封面
        /* W2W Extension, Name: w2w-advanced-coupon, Code: couponLogo */
        couponLogo: '/images/woo-logo-coupon.svg', // 领取优惠券弹窗中的logo
        /* W2W Extension, Name: w2w-advanced-coupon, Code: couponLogo */
        productPoster: '/images/product-poster.png', // 产品海报背景图
        /* W2W Extension, Name: w2w-products-groupon, Code: grouponPoster */
        grouponPoster: '/images/groupon-poster.png', // 拼团海报背景图
        /* W2W Extension, Name: w2w-products-groupon, Code: grouponPoster */
        /* W2W Extension, Name: w2w-advanced-address, Code: addressType */
        addressType: 'advanced', // 收货地址选取模式，wx微信收货地址模式 或 advanced导入微信地址+高级收货地址模式
        /* W2W Extension, Name: w2w-advanced-address, Code: addressType */
        //buyType: 'cart', // cart购物车模式 或 now立即购买模式 (2.3版本已新增立即购买功能，此选项废弃)
        paymentPopup: true, // 如后台没有开启需要复制链接的支付方式，请改为false，以避免不必要的支付方式弹窗
        showMainCategory: true, // 是否在分类页中子分类列表中显示主分类项
        cartTabIndex: 3, // 购物车tab的下标，用于设置红点
        myTabIndex: 4, // 我的页tab的下标，用于设置红点
        currency: '¥', // 货币符号
        /* 以下请勿随意修改 */
        mainColor: '#3db1b0', // 主题色
        apiPath: 'wp-json/w2w/v1/',
        apiList: {
            login: 'customers/login',
            scanqrcode: 'customers/scanqrcode',
            my_coupon: 'customers/coupon',
            favor: 'customers/favor',
            memberinfo: 'customers/memberinfo',
            address: 'customers/address',
            delete_address: 'customers/delete_address',
            index: 'store/index',
            coupon_center: 'store/coupons',
            countries: 'store/countries',
            states: 'store/states',
            about: 'store/about',
            product: 'products/',
            products: 'products',
            product_search: 'products/search',
            product_filter_orderby: 'products/filter_orderby',
            product_qrcode: 'products/qrcode',
            product_review: 'products/reviews',
            product_review_reply: 'products/reviews/reply',
            product_review_image: 'products/reviews/image',
            category: 'products/categories',
            cart: 'cart',
            checkout: 'cart/checkout',
            add_to_cart: 'cart/add',
            update_cart: 'cart/update_quantity',
            delete_cart: 'cart/delete',
            set_address: 'cart/address',
            shipping_method: 'cart/shipping',
            payment_method: 'cart/payment',
            cart_coupon: 'cart/coupon',
            remove_coupon: 'cart/remove_coupon',
            order: 'orders/',
            orders: 'orders',
            cancel_order: 'orders/cancel',
            confirm_order: 'orders/confirm',
            shipping_detail: 'orders/shipping_detail',
            payment: 'payment',
            post: 'posts/',
            posts: 'posts',
            post_category: 'posts/categories',
            post_comments: 'posts/comments',
            post_qrcode: 'posts/qrcode',
            // txvideo_info: 'util/txvideo_info',
            // txvideo: 'util/txvideo',
            groupon_checkout: 'groupon/checkout',
            groupon_order: 'groupon/order',
            groupon_detail: 'groupon/detail',
            groupon_qrcode: 'groupon/qrcode',
            groupon_products: 'groupon/products',
            groupon_orders: 'groupon/orders',
            invite: 'distribution/invite',
            distribution_info: 'distribution/info',
            distribution_records: 'distribution/records',
            distribution_qrcode: 'distribution/qrcode',
            distribution_product_qrcode: 'distribution/product/qrcode',
            points_info: 'points/info',
            points_records: 'points/records',
            points_tasks: 'points/tasks',
            points_store: 'points/store',
            points_redeem: 'points/redeem'
        },
        apiPathWP: 'wp-json/wp/v2/',
        apiListWP: {
            post_list: 'posts'
        },
        js_code: null,
        w2w_session: '',
        memberInfo: null,
        cart: null,
        cart_quantity: 0,
        country_id: 'CN',
        address: null,
        shipping: null,
        payment: null,
        coupons: [],
        userInfo: null,
    },
    Util: require('utils/util.js'),
    Methods: require('utils/methods.js'),
    Variables: require('utils/variables.js'),
    // 获取API地址
    API(apiName, WP = false) {
        var apiURL = WP ? this.data.apiPathWP : this.data.apiPath;
        apiURL += WP ? this.data.apiListWP[apiName] : this.data.apiList[apiName];
        return this.data.siteURL + apiURL;
    },
    // 获取地址参数
    getAddressParam() {
        var address = this.data.address;
        var address_param = {};
        if (address != '' && address != null) {
            if (address.userName != undefined) {
                address_param = {
                    country_id: this.data.country_id,
                    state: this.Util.getStateCode(address.provinceName),
                    city: address.cityName,
                    postcode: address.postalCode
                };
            }
            /* W2W Extension, Name: w2w-advanced-address, Code: addressAddressParam */
            else {
                var submitAddress = this.Util.addressTransform(address, 'submit');
                address_param = {
                    country_id: submitAddress.billing_country,
                    state: submitAddress.billing_state,
                    city: submitAddress.billing_city,
                    postcode: submitAddress.billing_postcode
                };
            }
            /* W2W Extension, Name: w2w-advanced-address, Code: addressAddressParam */
        }
        return address_param;
    },
    // 获取结算地址参数
    getOrderAddressParam() {
        var address = this.data.address,
            addressParams;
        if (address.userName) {
            addressParams = {
                billing_first_name: address.userName,
                billing_phone: address.telNumber,
                billing_country: this.data.country_id,
                billing_state: this.Util.getStateCode(address.provinceName),
                billing_city: address.cityName,
                billing_address_1: address.countyName + address.detailInfo,
                billing_postcode: address.postalCode,
            };
        }
        /* W2W Extension, Name: w2w-advanced-address, Code: addressOrderParam */
        else {
            addressParams = this.Util.addressTransform(address, 'submit');
        }
        /* W2W Extension, Name: w2w-advanced-address, Code: addressOrderParam */
        return addressParams;
    },
    // 获取订单参数
    getOrderParam() {
        var params = {
            // 2018-03-16 添加同意服务条款参数
            terms: true,
            _wpnonce: this.data.cart._wpnonce
        };
        var addressParams = this.getOrderAddressParam();
        params = Object.assign({}, params, addressParams);
        return params;
    },
    // 刷新会员信息
    refreshMemberInfo(callback = function() {}) {
        this.Util.network.GET({
            url: this.API('memberinfo'),
            params: {
                w2w_session: this.data.w2w_session
            },
            showLoading: false,
            success: data => {
                this.updateMembersInfo(data);
                callback(data);
            }
        });
    },
    // 更新会员信息
    updateMembersInfo(memberInfo) {
        this.data.memberInfo = memberInfo;
        if (memberInfo.orders.total > 0) {
            wx.showTabBarRedDot({
                index: this.data.myTabIndex
            })
        } else {
            wx.hideTabBarRedDot({
                index: this.data.myTabIndex
            });
        }
    },
    // 刷新购物车
    refreshCart(callback = function() {}, showLoading = true) {
        this.Util.network.GET({
            url: this.API('cart'),
            params: {
                w2w_session: this.data.w2w_session,
                check_cart_items: true
            },
            success: data => {
                this.updateCart(data);
                callback(data);
            }
        });
    },
    // 更新购物车
    updateCart(cart) {
        this.data.cart = cart;
        this.data.cart_quantity = cart == null ? 0 : cart.cart_contents_count;

        if (this.data.cart_quantity != 0) {
            wx.setTabBarBadge({
                index: this.data.cartTabIndex,
                text: this.data.cart_quantity.toString()
            })
        } else {
            wx.removeTabBarBadge({
                index: this.data.cartTabIndex
            });
        }
        if (cart != null) {
            this.data.coupons = cart.applied_coupons;
        }
    },
    // 检查App是否登录
    isLoggedIn() {
        return this.data.userInfo && this.data.w2w_session ? true : false;
    },
    checkLogin(callback = {}) {
        // 存在用户信息和SESSION
        if (this.isLoggedIn()) {
            // SESSION已过期（提前10分钟刷新）
            if (this.data.session_expire && Math.round(new Date / 1000) >= this.data.session_expire - 600) {
                wx.login({
                    success: res => {
                        console.log('wx.login成功', res);
                        this.data.js_code = res.code;
                        this.getUserInfo({
                            success: () => {
                                if (typeof callback.success == 'function') callback.success();
                            }
                        })
                    },
                    fail: res => {
                        console.error('wx.login失败', res);
                    }
                });
            } else {
                if (typeof callback.success == 'function') callback.success();
            }
        } else {
            wx.login({
                success: res => {
                    console.log('wx.login成功', res);
                    this.data.js_code = res.code;
                    if (typeof callback.fail == 'function') {
                        callback.fail();
                    }
                },
                fail: res => {
                    console.error('wx.login失败', res);
                }
            });
        }
    },
    // 登录
    login(userRes = null, callback = function() {}) {
        var params = {
            js_code: this.data.js_code
        };
        if (userRes) {
            params = Object.assign({}, params, {
                encryptedData: userRes.encryptedData,
                iv: encodeURIComponent(userRes.iv)
            });
        }
        this.Util.network.POST({
            url: this.API('login'),
            params: params,
            showLoading: userRes != null,
            success: data => {
                if (data.w2w_session) {
                    console.log('登录成功', data.w2w_session);
                    // 存储Session
                    this.data.user_id = data.user_id;
                    wx.setStorageSync('user_id', data.user_id);
                    this.data.w2w_session = data.w2w_session;
                    wx.setStorageSync('w2w_session', data.w2w_session);
                    this.data.session_expire = data.session_expire;
                    wx.setStorageSync('session_expire', data.session_expire);
                    callback(data.w2w_session);
                }
            },
            fail: data => {
                console.error('登录失败', data.code && data.message ? data.code + ': ' + data.message : '');
                this.checkLogin();
            },
            loadingTitle: '正在登录'
        });
    },
    // 按钮点击获取用户信息
    buttonGetUserInfo(e, callback) {
        var userRes = e.detail;
        if (userRes.errMsg == 'getUserInfo:ok') {
            console.log('获取用户信息成功', userRes);
            this.data.userInfo = userRes.userInfo;
            wx.setStorageSync('userInfo', userRes.userInfo);

            this.login(userRes, w2w_session => {
                this.refreshCart(cart => {
                    if (callback.success) {
                        callback.success({
                            userInfo: userRes.userInfo,
                            cart: cart
                        });
                    }
                });
            });
        } else {
            console.error('获取用户信息失败', userRes);
            if (callback.fail) callback.fail();
        }
    },
    getUserInfo(callback) {
        wx.getUserInfo({
            success: userRes => {
                console.log('获取用户信息成功', userRes);
                this.data.userInfo = userRes.userInfo;
                wx.setStorageSync('userInfo', userRes.userInfo);

                this.login(userRes, w2w_session => {
                    this.refreshCart(cart => {
                        if (callback.success) {
                            callback.success({
                                userInfo: userRes.userInfo,
                                cart: cart
                            });
                        }
                    });
                });
            },
            fail: () => {
                if (callback.fail) {
                    callback.fail();
                }
            }
        })
    },
    // 登出
    logout(reLaunch = true) {
        this.data.shipping = null;
        this.data.user_id = null;
        this.data.address = null;
        this.data.w2w_session = '';
        this.data.session_expire = '';
        this.data.userInfo = null;
        this.updateCart(null);
        //wx.clearStorageSync();
        wx.removeStorageSync('user_id');
        wx.removeStorageSync('w2w_session');
        wx.removeStorageSync('userInfo');
        wx.removeTabBarBadge({
            index: this.data.cartTabIndex
        });
        wx.hideTabBarRedDot({
            index: this.data.myTabIndex
        });
        if (reLaunch) {
            wx.reLaunch({
                url: '/pages/index/index'
            })
        }
    },
    // 微信支付
    requestPayment(paymentData) {
        // 获取支付参数
        this.Util.network.GET({
            url: this.API('payment'),
            params: {
                id: paymentData.id,
                w2w_session: this.data.w2w_session
            },
            success: data => {
                console.log('支付参数', data);
                if (data.success) {
                    // 发起微信支付
                    wx.requestPayment({
                        timeStamp: data.timeStamp,
                        nonceStr: data.nonceStr,
                        package: data.package,
                        signType: 'MD5',
                        paySign: data.paySign,
                        success: res => {
                            if (paymentData.success) paymentData.success(res);
                        },
                        fail: res => {
                            if (paymentData.fail) paymentData.fail(res);
                        },
                        complete: res => {
                            console.log('wx.requestPayment完成', res);
                            if (paymentData.complete) paymentData.complete(res);
                        }
                    });
                } else {
                    if (paymentData.fail) paymentData.fail(data);
                }
            }
        });
    },
    // 取消订单
    cancelOrder(params) {
        wx.showModal({
            title: '请确认',
            content: '确定取消订单？',
            confirmColor: this.data.mainColor,
            success: res => {
                if (res.confirm) {
                    this.Util.network.POST({
                        url: this.API('cancel_order'),
                        params: {
                            w2w_session: this.data.w2w_session,
                            id: params.id
                        },
                        success: data => {
                            if (params.success) {
                                params.success(data);
                            }
                        }
                    });
                }
            }
        })
    },
    // 取消订单
    confirmOrderReceived(params) {
        wx.showModal({
            title: '请确认',
            content: '确认收货？',
            confirmColor: this.data.mainColor,
            success: res => {
                if (res.confirm) {
                    this.Util.network.POST({
                        url: this.API('confirm_order'),
                        params: {
                            w2w_session: this.data.w2w_session,
                            id: params.id
                        },
                        success: data => {
                            if (params.success) {
                                params.success(data);
                            }
                        }
                    });
                }
            }
        })
    },
    // 跳转产品详情页
    goProductDetail(e, newPage = true, nextNewPage = true) {
        var id = e.currentTarget.dataset.id,
            name = e.currentTarget.dataset.name,
            url = '/pages/product-detail/product-detail?id=' + id + (name ? '&name=' + encodeURIComponent(name) : '') + '&popup=false&redirect=' + !nextNewPage;
        if (newPage) {
            wx.navigateTo({
                url: url
            })
        } else {
            wx.redirectTo({
                url: url
            })
        }
    },
    // 打开web-view
    openWebView(src) {
        wx.navigateTo({
            url: '/pages/web-view/web-view?src=' + encodeURIComponent(src)
        })
    },
    // 处理链接点击
    handleLinkClick(url, page = false) {
        url = url.trim();
        if (!url) {
            return;
        }

        if (/^http/.test(url)) {
            this.openWebView(url);
        } else if (/^wx/.test(url)) {
            var arr = url.split(':'),
                params = {
                    appId: arr[0]
                };
            if (arr[1]) {
                params.path = arr[1];
            }
            wx.navigateToMiniProgram(params);
        } else if (/^\/pages/.test(url)) {
            var tabBarList = ['index', 'category', 'post-list', 'cart', 'my'];
            var regex = new RegExp('(' + tabBarList.join('|') + ')\/\\1');
            if (regex.test(url)) {
                wx.switchTab({
                    url: url
                })
            } else {
                wx.navigateTo({
                    url: url
                })
            }
        } else if (/^phone:/.test(url)) {
            var phone = url.replace('phone:', '').trim();
            wx.makePhoneCall({
                phoneNumber: phone
            })
        } else if (/^image:/.test(url)) {
            var image = url.replace('image:', '').trim();
            wx.previewImage({
                urls: [image]
            })
        } else if (/^location:/.test(url)) {
            var location = url.replace('location:', '').trim();
            location = JSON.parse(location);
            wx.openLocation(location);
        } else if (/^coupon:/.test(url)) {
            var coupon = url.replace('coupon:', '').trim();
            page.receiveCouponRequest(coupon, data => {
                var msg = data.msg ? data.msg : '已领取！快去使用吧~';
                wx.showToast({
                    icon: 'none',
                    title: msg
                })
            });
        } else if (/^copy:/.test(url)) {
            var text = url.replace('copy:', '').trim();
            this.setClipboard(text);
        } else if (/^plugin(-private)?:\/\//.test(url)) {
            wx.navigateTo({
                url: url
            })
        }
    },
    // 复制到剪贴板
    setClipboard(text) {
        wx.setClipboardData({
            data: text,
            success: () => {
                wx.showToast({
                    title: '已复制',
                })
            }
        })
    },
    // 检查是否有虚拟产品
    checkVirtual(cart = null) {
        var flag = false;
        if (!cart) {
            cart = this.data.cart;
        }
        if (!cart) {
            return flag;
        }
        for (var key in cart.cart) {
            var item = cart.cart[key];
            if (item.product.virtual) {
                flag = true;
                break;
            }
        }
        return flag;
    },
    // 切换导航栏风格
    setNavStyle(style) {
        if (style == 'light') {
            wx.setNavigationBarColor({
                frontColor: '#000000',
                backgroundColor: '#ffffff'
            })
        } else if (style == 'dark') {
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#000000'
            })
        }
    },
    /* W2W Extension, Name: w2w-products-distribution, Code: reportInviterFunction */

/* W2W Extension, Name: w2w-products-distribution, Code: reportInviterFunction */
    // 获取分享信息
    getShareInfo(shareInfo = {}) {
        var info = {
            title: this.data.name,
            path: '/pages/index/index',
            params: {},
            imageUrl: this.data.shareCover
        };
        info = Object.assign({}, info, shareInfo);
        /* W2W Extension, Name: w2w-products-distribution, Code: shareUID */

/* W2W Extension, Name: w2w-products-distribution, Code: shareUID */
        if (info.params && Object.keys(info.params).length > 0) {
            info.path = info.path + '?' + this.Util.objToQueryString(info.params);
            delete info.params;
        }
        //console.log(info);
        return info;
    },
    onLaunch(options) {
        console.log('App onLaunch', options);

        if (!/\/$/.test(this.data.siteURL)) {
            this.data.siteURL += '/';
        }
        if (!/^http[s]*:\/\//.test(this.data.siteURL)) {
            this.data.siteURL = 'https://' + this.data.siteURL;
        }

        system.default.attachInfo();
        // 取出UserID Session 收货地址 用户信息
        this.data.user_id = wx.getStorageSync('user_id');
        this.data.w2w_session = wx.getStorageSync('w2w_session');
        this.data.session_expire = wx.getStorageSync('session_expire');
        this.data.address = wx.getStorageSync('address');
        this.data.userInfo = wx.getStorageSync('userInfo');

        /* W2W Extension, Name: w2w-products-distribution, Code: reportInviter */

/* W2W Extension, Name: w2w-products-distribution, Code: reportInviter */

        var updateManager = wx.getUpdateManager();
        updateManager.onUpdateReady(() => {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                confirmColor: this.data.mainColor,
                success(res) {
                    if (res.confirm) {
                        updateManager.applyUpdate();
                    }
                }
            })
        })
    }
})