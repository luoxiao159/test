// pages/product-detail/product-detail.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const Zan = require('../../vendor/ZanUI/index');
const Timer = require('../../utils/wxTimer.js');
const ReviewUitls = require('../../utils/review-utils.js');
// const Txv = requirePlugin('txvideo');
const app = getApp();

Page(Object.assign({}, Zan.Stepper, Zan.Tab, Zan.TopTips, app.Methods, ReviewUitls.methods, {
    data: Object.assign({}, app.Variables, ReviewUitls.variables, {
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_STATUSBAR_HEIGHT: wx.STATUS_BAR_HEIGHT + 'px',
        pageTitle: app.data.name,
        logo: app.data.logo,
        currency: app.data.currency,
        imgHeights: [],
        imgWidth: 750,
        current: 0,
        quantity: 1,
        productTabSelected: 'description',
        productTabList: [{
                id: 'description',
                title: '详情'
            },
            {
                id: 'review',
                title: '评价'
            }
        ],
        descriptionPadding: 10,
        wxTimerList: {},
        showNaviBar: false,
    }),
    // 随便逛逛
    goShopping() {
        wx.redirectTo({
            url: '/pages/product-list/product-list'
        })
    },
    // 打开产品选择弹窗
    openVariationPopup() {
        this.setData({
            isVariationPopup: true
        });
    },
    // 关闭产品选择弹窗
    closeVariationPopup() {
        if (this.wxTimer) {
            this.wxTimer.stop();
        }
        this.setData({
            isVariationPopup: false
        });
    },
    // 打开产品属性弹窗
    openAttributePopup() {
        this.setData({
            isAttributePopup: true
        });
    },
    // 关闭产品属性弹窗
    closeAttributePopup() {
        this.setData({
            isAttributePopup: false
        });
    },
    // 打开产品分享弹窗
    openSharePopup() {
        this.setData({
            isSharePopup: true
        });
    },
    // 关闭产品分享弹窗
    closeSharePopup() {
        this.setData({
            isSharePopup: false
        });
    },
    // 打开海报弹窗
    openPosterPopup(posterImage) {
        this.setData({
            isPosterPopup: true,
            posterImage: posterImage
        });
    },
    // 关闭海报弹窗
    closePosterPopup() {
        this.setData({
            isPosterPopup: false
        });
    },
    /* W2W Extension, Name: w2w-products-groupon, Code: grouponEvents */
    // 打开拼团规则弹窗
    openGrouponRulePopup() {
        this.setData({
            isGrouponRulePopup: true
        });
    },
    // 关闭拼团规则弹窗
    closeGrouponRulePopup() {
        this.setData({
            isGrouponRulePopup: false
        });
    },
    // 拼团结算
    goGrouponCheckout() {
        this.checkLogin(() => {
            wx.navigateTo({
                url: '/pages/groupon-checkout/groupon-checkout?product_id=' + this.data.id,
            })
        });
    },
    // 查看拼团
    goGroupon(e) {
        var grouponID = e.currentTarget.dataset.grouponId;
        wx.navigateTo({
            url: '/pages/groupon-result/groupon-result?groupon_id=' + grouponID,
        })
    },
    /* W2W Extension, Name: w2w-products-groupon, Code: grouponEvents */
    imageLoad(e) {

        // 获取图片下标
        var index = e.currentTarget.dataset.index;
        // 获取图片真实宽度  
        var imgWidth = e.detail.width,
            imgHeight = e.detail.height,
            // 宽高比  
            ratio = imgWidth / imgHeight;
        // 计算的高度值  
        var viewHeight = 750 / ratio;
        var imgHeight = viewHeight;
        var imgHeights = this.data.imgHeights;
        // 把每一张图片的高度记录到数组里  
        imgHeights[index] = imgHeight;
        this.setData({
            imgHeights: imgHeights
        })
    },
    // swiper切换
    swiperChange(e) {
        // 切换banner时停止当前视频播放
        if (this.playingVideo != undefined && this.data.galleryVideoPlaying === true) {
            this.playingVideo.pause();
        }
        this.setData({
            current: parseInt(e.detail.current)
        });
    },
    // 点击自定义封面播放视频
    playVideo(e) {
        var dataset = e.currentTarget.dataset,
            type = dataset.type,
            index = dataset.index,
            src = dataset.src;
        var id;
        if (type == 'video') {
            id = type + '_' + index
            var context = wx.createVideoContext(id);
            context.play();
        } 
    },
    // 点击自定义封面播放视频 - 详情
    playDetailVideo(e) {
        var dataset = e.detail,
            type = dataset.type,
            id = dataset.id;
 
    },
    // 视频播放
    videoPlay(e) {
        var dataset = e.currentTarget.dataset;
        if (dataset.type == 'detail') {
            dataset = e.detail;
        }
        var context, playingVideo;
        if (dataset.type == 'video') {
            context = dataset.context ? dataset.context : wx.createVideoContext(dataset.id);
        }

        // 阻止非点击造成的视频播放
        if (dataset.type == 'txvideo' && this.toPlayVideo != dataset.id) {
            context.pause();
            delete this.toPlayVideo;
            return;
        }
        playingVideo = context;

        // 播放新视频时停止之前视频的播放
        if (this.playingVideo != undefined && this.playingVideo !== playingVideo) {
            this.playingVideo.pause();
        }

        // 播放视频时保存当前视频的context
        if (this.playingVideo !== playingVideo) {
            setTimeout(() => {
                this.playingVideo = playingVideo;
            }, 100);
        }
    },
    // 视频暂停
    videoPause(e) {
        // 删除当前播放视频context
        if (this.playingVideo != undefined) {
            delete this.playingVideo;
        }
    },
    // 画廊视频播放
    galleryVideoPlay(e) {
        this.videoPlay(e);
        this.setData({
            galleryVideoPlaying: true
        });
    },
    // 画廊视频暂停
    galleryVideoPause(e) {
        this.videoPause(e);
        this.setData({
            galleryVideoPlaying: false
        });
    },
    // 选项卡变更
    handleZanTabChange({
        componentId,
        selectedId
    }) {
        if (componentId == 'product-tab') {
            this.setData({
                productTabSelected: selectedId
            });
        }
    },
    // 登录成功
    loginSuccess() {
        this.onPullDownRefresh();
        /*this.setData({
            cart_quantity: app.data.cart_quantity
        });*/
    },
    // 选项变更
    variationChange(e) {
        var attribute = e.currentTarget.dataset.attriubte,
            oldOption = e.currentTarget.dataset.oldOption,
            option = e.currentTarget.dataset.option,
            isAvailable = e.currentTarget.dataset.isAvailable;

        if (!isAvailable) {
            return;
        }

        if (oldOption == option) {
            var default_attributes = app.Util.cloneObj(this.data.product.default_attributes);
            delete default_attributes[attribute];
            this.setData({
                ['product.default_attributes']: default_attributes
            });
        } else {
            this.setData({
                ['product.default_attributes.' + attribute + '.option']: option
            });
        }

        this.setSelected();
    },
    // 设置选项 并从已选择选项获取变量产品ID
    setSelected() {
        if (this.data.product.type != 'variable') {
            return;
        }

        var attributes = app.Util.cloneObj(this.data.product.attributes),
            default_attributes = this.data.product.default_attributes,
            variations = this.data.product.variations;

        var variationCount = this.data.variationCount;
        var selectedAllVariation = Object.keys(default_attributes).length == variationCount;

        // 筛选可用选项
        for (var attr_key in attributes) {

            if (attributes[attr_key].variation == false) {
                continue;
            }

            var attribute_options = attributes[attr_key].options;

            for (var opt_index in attribute_options) {
                var attribute_option = attribute_options[opt_index];
                var default_attributes_clone = app.Util.cloneObj(default_attributes);

                if (default_attributes_clone[attr_key]) {
                    default_attributes_clone[attr_key].option = attribute_option.slug;
                } else {
                    default_attributes_clone = Object.assign({}, default_attributes_clone, {
                        [attr_key]: {
                            option: attribute_option.slug
                        }
                    });
                }

                if (this.findVariationMatchAttributes(variations, default_attributes_clone)) {
                    attributes[attr_key].options[opt_index].is_available = true;
                } else {
                    attributes[attr_key].options[opt_index].is_available = false;
                }
            }
        }

        this.setData({
            selectedAllVariation: selectedAllVariation,
            ['product.attributes']: attributes
        });

        var selectedVariation = null,
            inStock = true;

        // 已选择所有变量
        if (selectedAllVariation) {

            // 查找选择的变量
            selectedVariation = this.findVariationMatchAttributes(variations, default_attributes);
            if (selectedVariation) {

                // 显示促销
                this.setSaleCountDown(selectedVariation);

                inStock = selectedVariation.in_stock;

                var selectedAttributes = {};
                for (var attr_key in default_attributes) {
                    selectedAttributes['variation[' + attr_key + ']'] = default_attributes[attr_key].option;
                }
                this.setData({
                    selectedAttributes: selectedAttributes,
                    selectedVariation: selectedVariation
                });
            } else {
                this.clearSelected();
            }
        } else {
            this.setData({
                selectedVariation: selectedVariation
            });
        }

    },
    clearSelected() {
        this.setData({
            ['product.default_attributes']: []
        });
        this.setSelected();
    },
    // 属性是否有对应变量
    findVariationMatchAttributes(variations, attributes, force = false) {

        for (var v_index in variations) {
            var variation = variations[v_index];
            var match = true;

            for (var attr_key in attributes) {
                var attribute = attributes[attr_key].option,
                    variation_attribute = variation.attributes[attr_key].option;

                if (variation_attribute == '') {
                    continue;
                }
                if (variation_attribute != attribute || (!force && variation.visible == false)) {
                    match = false;
                    break;
                }
            }
            if (!match) {
                continue;
            }
            return variation;
        }
        return null;
    },
    // 数量选择器处理
    handleZanStepperChange(e) {
        this.setData({
            quantity: e.stepper
        });
    },
    // 添加到购物车
    detailAddToCart(e) {
        var product = this.data.product;
        var buyType = e.currentTarget.dataset.type || 'cart';
        var params = {
            product_id: product.id,
            quantity: this.data.quantity,
        };
        // 可变产品
        if (product.type == 'variable') {
            // 点击底栏的加入购物车需要弹出变量选择
            if (e.currentTarget.dataset.position == 'bottom-bar') {
                this.setData({
                    variationPopupBuyType: buyType
                });
                this.openVariationPopup();
                return;
            }

            // 是否选择全部必须变量
            if (this.data.selectedAllVariation) {
                params.variation_id = this.data.selectedVariation.id;
                params = Object.assign(params, this.data.selectedAttributes);
            } else {
                return;
            }
        }

        this.checkLogin(() => {
            // 立即购买
            if (buyType == 'buynow') {
                app.buyNowParams = params;
                wx.navigateTo({
                    url: '/pages/checkout/checkout'
                })
            }
            // 加入购物车
            else {
                params.w2w_session = app.data.w2w_session;
                app.Util.network.POST({
                    url: app.API('add_to_cart'),
                    params: params,
                    success: data => {
                        if (data.errors.length > 0) {
                            this.showZanTopTips(data.errors);
                        } else {
                            this.closeVariationPopup();
                            wx.showToast({
                                title: '已添加'
                            })
                        }
                        app.updateCart(data);
                        this.setData({
                            cart_quantity: app.data.cart_quantity
                        });
                    }
                });
            }
        });
    },
    // 产品画廊全屏查看图片
    galleryViewFullScreen(e) {
        var product_images = this.data.product.images,
            currentURL = e.currentTarget.dataset.src,
            images_urls = [];
        for (var i in product_images) {
            images_urls.push(product_images[i].full.url);
        }
        wx.previewImage({
            current: currentURL,
            urls: images_urls,
        })
    },
    // 选项弹窗全屏查看图片
    variationViewFullScreen(e) {
        var url = e.currentTarget.dataset.src;
        wx.previewImage({
            urls: [url]
        })
    },
    // 移除指定Tab
    removeTab(name) {
        for (var i in this.data.productTabList) {
            if (this.data.productTabList[i].id == name) {
                this.data.productTabList.splice(i, 1);
                this.setData({
                    productTabList: this.data.productTabList
                });
                break;
            }
        }
    },
    /* W2W Extension, Name: w2w-products-favor, Code: switchFavor */
    // 收藏/取消收藏
    switchFavor() {
        var params = {
            id: this.data.id
        };
        if (!app.isLoggedIn()) {
            params.in_favor = true;
        }
        this.checkLogin(() => {
            app.Util.network.POST({
                url: app.API('favor'),
                params: Object.assign({}, params, {
                    w2w_session: app.data.w2w_session
                }),
                success: data => {
                    wx.showToast({
                        title: data.in_favor ? '已收藏' : '已取消',
                    })
                    this.setData({
                        ['product.in_favor']: data.in_favor
                    });
                }
            });
        });
    },
    /* W2W Extension, Name: w2w-products-favor, Code: switchFavor */
    // 分享海报
    sharePoster() {
        this.checkLogin(() => {
            var api = 'product_qrcode';
            /* W2W Extension, Name: w2w-products-distribution, Code: qrcodeAPI */

/* W2W Extension, Name: w2w-products-distribution, Code: qrcodeAPI */
            app.Util.network.GET({
                url: app.API(api),
                params: {
                    id: this.data.id,
                    w2w_session: app.data.w2w_session
                },
                success: data => {
                    wx.showLoading({
                        title: '正在生成海报',
                        mask: true,
                    });
                    wx.getImageInfo({
                        src: app.data.userInfo.avatarUrl,
                        success: avatarRes => {
                            console.log('头像本地位置', avatarRes.path);
                            wx.getImageInfo({
                                src: data.url,
                                success: qrcodeRes => {
                                    console.log('二维码图片本地位置', qrcodeRes.path);
                                    //var random = app.Util.getRandom(0, this.data.product.images.length - 1);
                                    wx.getImageInfo({
                                        src: this.data.product.images[0].full.url,
                                        success: res => {
                                            console.log('产品图片本地位置', res.path);
                                            var resize = app.Util.resizeRect(res.width, res.height, 320, 320);
                                            this.createPosterLocal(avatarRes.path, res.path, qrcodeRes.path, this.data.product, resize);
                                        },
                                        fail: res => {
                                            wx.hideLoading();
                                            wx.showToast({
                                                icon: 'none',
                                                title: '下载图片失败'
                                            })
                                        }
                                    });
                                },
                                fail: res => {
                                    wx.hideLoading();
                                    wx.showToast({
                                        icon: 'none',
                                        title: '下载图片失败'
                                    })
                                }
                            });
                        },
                        fail: res => {
                            wx.hideLoading();
                            wx.showToast({
                                icon: 'none',
                                title: '下载图片失败'
                            })
                        }
                    });
                }
            });
        });
    },
    createPosterLocal(avatarLocal, imageLocal, qrcodeLocal, product, resize) {
        var context = wx.createCanvasContext('poster_canvas');
        context.drawImage(app.data.productPoster, 0, 0); // 绘制海报背景

        context.setTextAlign('center');
        context.setFillStyle('#555');
        context.setFontSize(38);
        context.fillText(app.data.userInfo.nickName, 420, 315); // 绘制名字

        /* 绘制头像 */
        var r = 87,
            avatarX = 333,
            avatarY = 78;
        context.save();
        context.beginPath();
        context.arc(avatarX + r, avatarY + r, r, 0, 2 * Math.PI);
        context.closePath();
        context.clip();
        context.drawImage(avatarLocal, avatarX, avatarY, r * 2, r * 2);
        context.restore();

        r = 10;
        var imageX = 260,
            imageY = 500;
        context.save();
        context.beginPath();
        context.moveTo(imageX, imageY);
        context.arc(imageX + r, imageY + r, r, Math.PI, Math.PI * 1.5);
        context.lineTo(imageX + resize.dWidth - r, imageY);
        context.arc(imageX + resize.dWidth - r, imageY + r, r, Math.PI * 1.5, Math.PI * 2);
        context.lineTo(imageX + resize.dWidth, imageY + resize.dHeight - r);
        context.arc(imageX + resize.dWidth - r, imageY + resize.dHeight - r, r, 0, Math.PI * 0.5);
        context.lineTo(imageX + r, imageY + resize.dHeight);
        context.arc(imageX + r, imageY + resize.dHeight - r, r, Math.PI * 0.5, Math.PI);
        context.closePath();
        context.clip();
        context.drawImage(imageLocal, resize.sX, resize.sY, resize.sWidth, resize.sHeight, imageX, imageY, resize.dWidth, resize.dHeight); // 绘制首图
        context.restore();

        context.drawImage(qrcodeLocal, 100, 1125, 180, 180); // 绘制二维码

        context.setTextAlign('left');
        context.setFillStyle('#888');
        context.setFontSize(24);
        context.fillText('分享自 ' + app.data.name, 322, 1250);
        context.setFillStyle('#000000');
        this.drawProductMeta(context, product); // 产品信息
        context.draw(false, () => {
            wx.canvasToTempFilePath({
                canvasId: 'poster_canvas',
                success: res => {
                    var tempFilePath = res.tempFilePath;
                    wx.hideLoading();
                    console.log('海报图片路径', res.tempFilePath);
                    this.closeSharePopup();
                    this.openPosterPopup(res.tempFilePath);
                },
                fail: function(res) {
                    console.log(res);
                }
            });
        });
    },
    // 绘制标题、短描述、价格
    drawProductMeta(context, product) {
        context.setFillStyle('#505050');
        context.setTextAlign('center');
        context.font = "100 36px sans-serif";

        var lineStartY = 920;

        var title = product.name;
        var titleLineHeight = 45;

        // 绘制标题
        var titleArr = app.Util.canvasSplitText(context, title, 560);
        var text = titleArr.length > 1 ? titleArr[0].substr(0, titleArr[0].length - 1) + '...' : titleArr[0];
        context.fillText(text, 420, lineStartY);
        lineStartY += titleLineHeight;

        // 绘制价格
        context.setFillStyle('#e84641');
        context.setTextAlign('center');
        context.setFontSize(64);
        lineStartY = lineStartY + 50;

        var currency = app.data.currency,
            priceStr = '';

        if (product.type == 'variable' && product.min_price != product.max_price) {
            priceStr = currency + product.min_price + '-' + currency + product.max_price;
        } else if (product.price != '') {
            priceStr = currency + product.price;
        }

        context.fillText(priceStr, 420, lineStartY);
        context.save();
    },
    // 保存海报
    savePoster() {
        wx.saveImageToPhotosAlbum({
            filePath: this.data.posterImage,
            success: result => {
                this.closePosterPopup();
                wx.showModal({
                    title: '提示',
                    content: '海报已存入手机相册，赶快分享吧~',
                    showCancel: false,
                    confirmColor: this.data.mainColor
                })
            },
            fail: err => {
                console.log('保存海报错误', err);
                this.closePosterPopup();
                if (err.errMsg === 'saveImageToPhotosAlbum:fail auth deny') {
                    wx.showToast({
                        icon: 'none',
                        title: '请到设置中打开保存图片权限'
                    })
                }
            }
        });
    },
    addToCart(e) {
        this.doAddToCart(e, () => {
            this.setData({
                cart_quantity: app.data.cart_quantity
            });
        }, false);
    },
    goReviewList(e) {
        wx.navigateTo({
            url: '/pages/product-review-list/product-review-list?id=' + this.options.id
        })
    },
    goProductDetail(e) {
        app.goProductDetail(e, !this.data.redirect, false);
    },
    goCart() {
        wx.switchTab({
            url: '/pages/cart/cart'
        })
    },
    onLoad(options) {
        this.setData({
            currentPages: getCurrentPages().length
        });
        if (options.scene) {
            var scene = app.Util.queryStrToObj(decodeURIComponent(options.scene));
            options = Object.assign({}, options, scene);
        }
        this.options = options;

        app.checkLogin({
            success: () => {
                /* W2W Extension, Name: w2w-products-distribution, Code: loginSuccessReportInviter */

/* W2W Extension, Name: w2w-products-distribution, Code: loginSuccessReportInviter */
                if (!app.data.cart) {
                    app.refreshCart(cart => {
                        this.setData({
                            cart_quantity: app.data.cart_quantity
                        });
                    });
                }
            },
            fail: () => {
                /* W2W Extension, Name: w2w-products-distribution, Code: loginFailReportInviter */

/* W2W Extension, Name: w2w-products-distribution, Code: loginFailReportInviter */
            }
        });

        // 加载成功前即显示标题
        var product_title = decodeURIComponent(options.name);
        if (product_title != 'undefined') {
            wx.setNavigationBarTitle({
                title: product_title
            })
            this.setPageTitle(product_title);
        }

        this.setData({
            id: options.id,
            product: null,
            product_name: product_title,
            cart_quantity: app.data.cart_quantity,
            selectedAllVariation: null,
            selectedVariation: null,
            selectedAttributes: null,
            redirect: options.redirect === 'true'
        });

        app.Util.network.GET({
            url: app.API('product') + options.id,
            params: app.isLoggedIn() ? {
                w2w_session: app.data.w2w_session
            } : {},
            success: data => {

                var product = data;

                /* W2W Extension, Name: w2w-products-groupon, Code: grouponOnLoad */
                if (product.groupon) {
                    app.Util.network.GET({
                        url: app.API('groupon_orders'),
                        params: {
                            product_id: product.id
                        },
                        showLoading: false,
                        success: data => {
                            this.setData({
                                grouponOrders: data
                            });
                        }
                    });
                }
                /* W2W Extension, Name: w2w-products-groupon, Code: grouponOnLoad */

                // 获取产品评价
                app.Util.network.GET({
                    url: app.API('product_review'),
                    params: {
                        product_id: product.id
                    },
                    showLoading: false,
                    success: data => {
                        var reviewImages = [];
                        for (var i in data) {
                            for (var j in data[i].images) {
                                reviewImages.push(data[i].images[j]);
                            }
                        }
                        this.setData({
                            reviewImages: reviewImages,
                            reviews: data
                        });
                    }
                });

                // 获取相关产品
                if (product.related_ids.length > 0) {
                    var related_ids = {};
                    for (var i in product.related_ids) {
                        related_ids['include[' + i + ']'] = product.related_ids[i];
                    }
                    app.Util.network.GET({
                        url: app.API('products'),
                        params: Object.assign({},
                            related_ids, {
                                orderby: 'include',
                                per_page: product.related_ids.length
                            }
                        ),
                        showLoading: false,
                        success: data => {
                            this.setData({
                                related_products: data
                            });
                        }
                    });
                }

                // 产品变量、可见属性个数
                var variationCount = 0,
                    visibleAttributeCount = 0,
                    theOnlyVaration; // variationCount为1时，此值为唯一一个的可选属性
                for (var i in product.attributes) {
                    if (product.attributes[i].variation == true) {
                        variationCount++;
                        theOnlyVaration = product.attributes[i];
                    }
                    if (product.attributes[i].visible == true) {
                        visibleAttributeCount++;
                    }
                }

                var totalStock = null;
                if (product.type == 'variable') {
                    for (var i in product.variations) {
                        if (product.variations[i].in_stock && product.variations[i].stock_quantity != null) {
                            if (totalStock == null) totalStock = 0;
                            totalStock += product.variations[i].stock_quantity;
                        }
                    }
                } else {
                    totalStock = product.stock_quantity;
                }

                this.setData({
                    product: product,
                    variationCount: variationCount,
                    visibleAttributeCount: visibleAttributeCount,
                    totalStock: totalStock,
                    ['productTabList[1].title']: '评价(' + product.rating_count + ')',
                    /* W2W Extension, Name: w2w-products-favor, Code: cartPosition */
                    favor: true,
                    /* W2W Extension, Name: w2w-products-favor, Code: cartPosition */
                    //isPopup: options.popup == 'true' ? true : false
                });
                wx.setNavigationBarTitle({
                    title: product.name
                })
                this.setPageTitle(product.name);

                this.setSelected();

                // 设置选项的图片
                if (variationCount == 1) {
                    var data = {};
                    for (var i in theOnlyVaration.options) {
                        var attr = {
                            [theOnlyVaration.slug]: {
                                option: theOnlyVaration.options[i].slug
                            }
                        };
                        var variation = this.findVariationMatchAttributes(this.data.product.variations, attr, true);
                        if (variation) {
                            data['product.attributes.' + theOnlyVaration.slug + '.options[' + i + '].image'] = variation.image[0].full.url
                        };
                    }
                    if (data) {
                        this.setData(data);
                    }
                }

                // 描述和短描述
                //var WxParse = require('../../vendor/wxParse/wxParse.js');
                //WxParse.wxParse('short_description', 'html', data.short_description, this, 5);
                //WxParse.wxParse('description', 'html', data.description, this, 5);

                // 限时促销
                if (product.type == 'simple') {
                    this.setSaleCountDown(product);
                }

                // 弹窗
                if (options.popup == 'true') this.openVariationPopup();
            },
            // 获取产品失败
            fail: () => {
                this.setData({
                    product: false
                });
            }
        });
    },
    // 设置显示促销倒计时
    setSaleCountDown(product) {
        if (this.wxTimer) {
            this.wxTimer.stop();
        }

        if (product.date_on_sale_to != '') {
            var date1 = new Date(),
                date2 = new Date(product.date_on_sale_to.replace(/\-/g, '/')),
                diff = app.Util.diffTime(date1, date2);

            if (date1.getTime() < date2.getTime()) {
                this.wxTimer = new Timer({
                    beginTime: diff.hours + ':' + diff.minutes + ':' + diff.seconds,
                    days: diff.days,
                    name: 'timerCountDown',
                    intervalFn: (i, timerObj) => {
                        this.setData({
                            onSaleCountDown: timerObj
                        });
                    }
                })
                this.wxTimer.start(this);
            } else {
                this.setData({
                    onSaleCountDown: {
                        days: 0,
                        hours: '00',
                        minutes: '00',
                        seconds: '00'
                    }
                });
            }
        }
    },
    onPageScroll(res) {
        if (res.scrollTop >= 300 && this.data.showNaviBar != true) {
            this.setData({
                showNaviBar: true
            });
            wx.setNavigationBarColor({
                frontColor: '#000000',
                backgroundColor: '#ffffff'
            })
        } else if (res.scrollTop < 300 && this.data.showNaviBar != false) {
            this.setData({
                showNaviBar: false
            });
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#000000'
            })
        }
    },
    onShow() {
        if (this.wxTimer) {
            if (this.wxTimer instanceof Array) {
                for (var i in this.wxTimer) {
                    this.wxTimer[i].calibration();
                }
            } else {
                this.wxTimer.calibration();
            }
        }
        if (app.data.cart) {
            this.setData({
                cart: app.data.cart
            });
        }
    },
    onPullDownRefresh() {
        this.onLoad({
            id: this.data.id,
            name: this.data.product_name,
            popup: false
        });
    },
    onShareAppMessage() {
        this.closeSharePopup();
        return app.getShareInfo({
            title: this.data.product.name,
            path: '/pages/product-detail/product-detail',
            params: {
                id: this.data.id,
                name: encodeURIComponent(this.data.product.name)
            },
            imageUrl: this.data.product.images[0].full.url,
        });
    }
}))