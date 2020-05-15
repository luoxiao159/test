// pages/template/template.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const Zan = require('../../vendor/ZanUI/index');
const app = getApp();
// const Txv = requirePlugin('txvideo');
const Modules = require('../../vendor/modules/modules.js');
const currentPages = getCurrentPages();

Page(Object.assign({}, Zan.TopTips, Zan.NoticeBar, app.Methods, Modules.Methods, {
    data: Object.assign({}, app.Variables, Modules.Variables, {
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        STATUS_BAR_HEIGHT: wx.STATUS_BAR_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        PIXEL_RATIO: wx.PIXEL_RATIO,
        pageTitle: app.data.name,
        currency: app.data.currency,
        currentPages: currentPages,
        bannerSettings: [],
        currentPost: 0,
    }),
    addToCart(e) {
        this.doAddToCart(e);
    },
    goTop() {
        wx.pageScrollTo({
            scrollTop: 0
        })
    },
    imageLoad() {},
    // swiper切换
    swiperChange(e) {
        var moduleIndex = e.currentTarget.dataset.moduleIndex,
            current = e.detail.current,
            banner = this.data.contentType == 'module' ? this.data.modules[moduleIndex].fields.banner : this.data.banner,
            type = banner[current].type;
        // 切换banner时停止当前视频播放
        if (this.playingVideo != undefined && this.playingVideo.moduleIndex == moduleIndex) {
            this.playingVideo.context.pause();
        }
        this.setData({
            ['bannerSettings[' + moduleIndex + '].current']: parseInt(current)
        });
    },
    // 点击自定义封面播放视频
    playVideo(e) {
        var dataset = e.currentTarget.dataset,
            moduleIndex = dataset.moduleIndex,
            type = dataset.type,
            index = dataset.index,
            src = dataset.src;
        var id;
        if (type == 'video') {
            id = type + '_' + moduleIndex + '_' + index;
            var context = wx.createVideoContext(id);
            context.play();
        } else if (type == 'txvideo') {
            id = src;
            var context = Txv.getTxvContext(id);
            context.play();
        }
        this.toPlayVideo = {
            type: type,
            id: id
        };
    },
    // 点击自定义封面播放视频 - 详情
    playDetailVideo(e) {
        var dataset = e.detail,
            type = dataset.type,
            id = dataset.id;

        this.toPlayVideo = {
            type: type,
            id: id
        };
        if (type == 'txvideo') {
            var context = Txv.getTxvContext(id);
            context.play();
        }
    },
    // 视频播放
    videoPlay(e) {
        var dataset = e.currentTarget.dataset;
        if (dataset.type == 'detail') {
            dataset = e.detail;
        }
        var moduleIndex = dataset.moduleIndex,
            id = dataset.id,
            type = dataset.type;

        var context, playingVideo;
        if (type == 'video') {
            context = dataset.context ? dataset.context : wx.createVideoContext(dataset.id);
        } else if (type == 'txvideo') {
            context = Txv.getTxvContext(id);
        }

        // 阻止非点击造成的视频播放
        if (!this.toPlayVideo || this.toPlayVideo.type != type || this.toPlayVideo.id != id) {
            context.pause();
            delete this.toPlayVideo;
            return;
        }

        playingVideo = {
            moduleIndex: moduleIndex,
            context: context
        };

        // 播放新视频时停止之前视频的播放
        if (this.playingVideo != undefined && this.playingVideo.context !== playingVideo.context) {
            this.playingVideo.context.pause();
        }

        // 播放视频时保存当前视频的context
        if (this.playingVideo == undefined || (this.playingVideo != undefined && this.playingVideo.context !== playingVideo.context)) {
            setTimeout(() => {
                this.playingVideo = playingVideo;
                if (e.currentTarget.dataset.type != 'detail') {
                    this.setData({
                        ['bannerSettings[' + moduleIndex + '].playing']: true
                    });
                }
            }, 100);
        }
    },
    // 视频暂停
    videoPause(e) {
        // 删除当前播放视频context
        if (this.playingVideo != undefined) {
            delete this.playingVideo;
        }
        if (e.currentTarget.dataset.type != 'detail') {
            var moduleIndex = e.currentTarget.dataset.moduleIndex;
            this.setData({
                ['bannerSettings[' + moduleIndex + '].playing']: false
            });
        }
    },
    // 跳转文章列表页
    goPostList() {
        wx.switchTab({
            url: '/pages/post-list/post-list'
        })
    },
    // 跳转文章详情页
    goPostDetail(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/post-detail/post-detail?id=' + id
        })
    },
    // 跳转产品详情页
    goProductDetail(e) {
        app.goProductDetail(e);
    },
    /* W2W Extension, Name: w2w-advanced-coupon, Code: indexCouponEvents */
    goToUseCoupon(e) {
        this.closeCouponPopup();
        var code = e.currentTarget.dataset.code;
        wx.navigateTo({
            url: '/pages/product-list/product-list?coupon=' + code
        })
    },
    /* W2W Extension, Name: w2w-advanced-coupon, Code: indexCouponEvents */
    
    setPostInterval(length) {
        if (length == 0) return;
        if (this.postTimer == undefined) {
            this.postTimer = setInterval(() => {
                if (this.pageHide === true) {
                    return;
                }
                if (this.currentPost == undefined) {
                    this.currentPost = 0;
                }
                this.setData({
                    currentPost: this.currentPost
                });
                this.currentPost++;
                if (this.currentPost >= length) {
                    this.currentPost = 0;
                }
            }, 5000);
        } else {
            this.currentPost = 0;
            this.setData({
                currentPost: this.currentPost
            });
        }
    },
    load() {
        var params = {};
        if (this.options.id) {
            params.template_id = this.options.id;
        }
        app.Util.network.GET({
            url: app.API('index'),
            params: params,
            success: data => {
                this.setData({
                    rending: true
                });
                var hasNotice;
                var navBarBackgroundColor = '#fff',
                    navBarTheme = 'light',
                    backgroundTextStyle = 'dark',
                    backgroundColor = '#f5f5f5';
                for (var i in data.modules) {
                    var module = data.modules[i];
                    if (module.name == 'notice') {
                        hasNotice = true;
                    } else if (module.name == 'posts' && module.fields && module.fields.layout == 'title') {
                        this.setPostInterval(module.data.length);
                    } else if (module.name == 'background') {
                        if (module.bg) {
                            navBarBackgroundColor = module.bg;
                            backgroundColor = module.bg;
                        }
                    } else if (module.name == 'navbar') {
                        if (module.bg) {
                            navBarBackgroundColor = module.bg;
                            backgroundColor = module.bg;
                        }
                    } else if (module.name == 'search') {
                        if (module.fields && module.fields.layout == 'navbar' && module.bg) {
                            navBarBackgroundColor = module.bg;
                            backgroundColor = module.bg;
                            if (module.fields.transparent) {
                                this.searchBgRestore = true;
                                this.searchModuleIndex = i;
                                this.searchBgRestoreHeight = module.fields.bg_restore / wx.PIXEL_RATIO;
                                this.navBarBackgroundColor = module.bg;
                                data.modules[i].bg = 'transparent';
                            } else {
                                this.searchBgRestore = false;
                            }
                            this.searchNavReverse = Boolean(module.fields.reverse);
                        }
                    }
                }


                var backgroundTextStyle = app.Util.lightOrDark(backgroundColor);
                wx.setBackgroundTextStyle({
                    textStyle: (backgroundTextStyle == 'light' ? 'dark' : 'light') // 下拉背景字体、loading 图的样式
                });
                wx.setBackgroundColor({
                    backgroundColor: backgroundColor, // 窗口的背景色
                    backgroundColorTop: backgroundColor, // 顶部窗口的背景色
                    backgroundColorBottom: backgroundColor, // 底部窗口的背景色
                });

                navBarTheme = app.Util.lightOrDark(navBarBackgroundColor);
                data.navBarTheme = navBarTheme;
                if (this.searchNavReverse) {
                    this.navBarTheme = navBarTheme;
                    this.navBarReverseTheme = navBarTheme == 'light' ? 'dark' : 'light';
                    app.setNavStyle(this.navBarReverseTheme);
                } else {
                    app.setNavStyle(navBarTheme);
                }

                this.setData(data, () => {
                    if (data.notice || hasNotice) {
                        this.initZanNoticeBarScroll('noticebar');
                    }
                });
            }
        });
    },
    onLoad(options) {
        if (options.scene) {
            var scene = app.Util.queryStrToObj(decodeURIComponent(options.scene));
            options = Object.assign({}, options, scene);
        }
        this.options = options;
        clearInterval(this.postTimer);
        this.load();
    },
    onPullDownRefresh() {
        this.load();
    },
    onShow() {
        this.pageHide = false;
    },
    onHide() {
        this.pageHide = true;
    },
    // 页面滚动
    onPageScroll(e) {
        var scrollTop = e.scrollTop;
        if (scrollTop > 1000 && this.data.goTopShow != true) {
            this.setData({
                goTopShow: true
            });
        } else if (scrollTop <= 1000 && this.data.goTopShow != false) {
            this.setData({
                goTopShow: false
            });
        }

        if (this.searchBgRestore) {
            if (scrollTop > this.searchBgRestoreHeight && this.data.modules[this.searchModuleIndex].bg != this.navBarBackgroundColor) {
                this.setData({
                    ['modules[' + this.searchModuleIndex + '].bg']: this.navBarBackgroundColor
                });
                if (this.searchNavReverse) {
                    app.setNavStyle(this.navBarThemes);
                }
            } else if (scrollTop <= this.searchBgRestoreHeight && this.data.modules[this.searchModuleIndex].bg != 'transparent') {
                this.setData({
                    ['modules[' + this.searchModuleIndex + '].bg']: 'transparent'
                });
                if (this.searchNavReverse) {
                    app.setNavStyle(this.navBarReverseTheme);
                }
            }
        }
    },
    onShareAppMessage() {
        return app.getShareInfo({
            path: '/pages/template/template',
            params: this.options,
            appReportInviter: true
        });
    }
}))