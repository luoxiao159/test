/**
 * Project: lazy-image
 * Description: 小程序图片懒加载组件
 * Author: 
 * Organization: 
 * Version: 20200212
 */

const app = getApp();

Component({
    properties: {
        src: {
            type: String,
            value: '',
            observer(newVal, oldVal) {
                if (newVal != oldVal) {
                    this.setData({
                        show: false
                    }, () => {
                        this.updateStyles();
                    });
                }
            }
        },
        rectMeta: {
            type: String,
            value: '',
        },
        dynamicWidth: {
            type: Boolean,
            value: false,
        },
        fullWidth: {
            type: Boolean,
            value: false,
        },
        width: {
            type: Number,
            value: 0,
        },
        height: {
            type: Number,
            value: 0,
        },
        imgStyle: {
            type: String,
            value: ''
        },
        bgColor: {
            type: String,
            value: '#eee'
        },
        mode: {
            type: String,
            value: ''
        }
    },
    data: {
        loadingImage: app.data.lazyLoadLogo
    },
    options: {
        addGlobalClass: true
    },
    attached() {
        this.updateStyles();
    },
    detached() {
        this.removeObserver();
    },
    methods: {
        imageLoad(e) {
            this.setData({
                show: true
            }, () => {
                this.triggerEvent('load', e.detail);
            });
        },
        imageError(e) {
            this.triggerEvent('error', e.detail);
        },
        addObserver() {
            var that = this;
            this.observer = this.createIntersectionObserver().relativeToViewport({
                bottom: -10
            }).observe('.lazy-image', function(res) {
                that.setData({
                    load: true
                });
                this.disconnect();
            })
        },
        removeObserver() {
            if (this.observer) {
                this.observer.disconnect();
            }
        },
        updateStyles() {
            this.getStyles(styles => {
                this.setData({
                    styles: styles
                }, () => {
                    this.addObserver();
                });
            });
        },
        getStyles(callback = () => {}) {
            var width, height, styles;
            if (this.data.rectMeta && this.data.rectMeta.trim() != '') {
                var rect = JSON.parse(this.data.rectMeta);
                width = rect.width ? rect.width : 0;
                height = rect.height ? rect.height : 0;
            } else if (this.data.width && this.data.height) {
                width = this.data.width;
                height = this.data.height;
            }

            if (this.data.dynamicWidth && this.data.fullWidth) {
                styles = 'position:absolute;top:0;left:0;width:100%;height:100%;';
            } else if (this.data.dynamicWidth && width && height) {
                /*var query = this.createSelectorQuery();
                query.select('.lazy-image-wrapper').boundingClientRect();
                query.exec(res => {
                    var realHeight = res[0].width / width * height;
                    styles = 'width:' + res[0].width + 'px;height:' + realHeight + 'px';
                    callback(styles);
                })*/
                styles = 'padding-bottom:' + (height / width * 100) + '%';
            } else if (this.data.fullWidth && width && height) {
                var realHeight = 750 / width * height;
                styles = 'width:750rpx;height:' + realHeight + 'rpx';
            } else if (this.data.imgStyle) {
                styles = this.data.imgStyle;
            } else if (width && height) {
                styles = 'width:' + width + 'px;height:' + height + 'px';
            } else {
                styles = 'width:100%;height:100%';
            }

            styles += ';background-color:' + this.data.bgColor + ';';
            callback(styles);
        }
    }
})