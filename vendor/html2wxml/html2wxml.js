var html2wxml = require('html2wxml-main.js');

Component({
    data: {},
    options: {
        addGlobalClass: true
    },
    properties: {
        text: {
            type: String,
            value: null,
            observer: function(newVal, oldVal) {
                if (newVal == '') return;

                if (this.data.type == 'html' || this.data.type == 'markdown' || this.data.type == 'md') {
                    var data = {
                        text: this.data.text,
                        type: this.data.type,
                        highlight: this.data.highlight,
                        linenums: this.data.linenums
                    };

                    if (this.data.imghost != null) {
                        data.imghost = this.data.imghost;
                    }
                    console.log('html2wxml.为解决');
                    // wx.request({
                    //     url: 'https://www.qwqoffice.com/html2wxml/',
                    //     data: data,
                    //     method: 'POST',
                    //     header: {
                    //         'content-type': 'application/x-www-form-urlencoded'
                    //     },
                    //     success: res => {
                    //         html2wxml.html2wxml(res.data, this);
                    //     }
                    // })
                }
            }
        },
        json: {
            type: Object,
            value: {},
            observer: function(newVal, oldVal) {
                html2wxml.html2wxml(this.data.json, this);
            }
        },
        type: {
            type: String,
            value: 'html'
        },
        highlight: {
            type: Boolean,
            value: true,
        },
        highlightStyle: {
            type: String,
            value: 'darcula'
        },
        linenums: {
            type: Boolean,
            value: true,
        },
        padding: {
            type: Number,
            value: 5
        },
        imghost: {
            type: String,
            value: null
        },
		viewImage:{
			type: Boolean,
			value: true,
		},
        showLoading: {
            type: Boolean,
            value: true
        }
    },
    methods: {
        wxmlTagATap: function(e) {
            this.triggerEvent('WxmlTagATap', {
                src: e.currentTarget.dataset.src
            });
        },
        productTap(e) {
			var id = e.currentTarget.dataset.id;
            wx.navigateTo({
                url: '/pages/product-detail/product-detail?id=' + id
            })
        },
        postTap(e) {
            var id = e.currentTarget.dataset.id;
            wx.navigateTo({
                url: '/pages/post-detail/post-detail?id=' + id
            })
        },
        receiveCoupon(e) {
            this.triggerEvent('WxmlReceiveCoupon', {
                code: e.currentTarget.dataset.code
            });
        },
        videoPlay(e) {
            var dataset = e.currentTarget.dataset;
            if (dataset.type == 'video') {
                var context = wx.createVideoContext(dataset.id, this);
                dataset.context = context;
            }
            this.triggerEvent('WxmlVideoPlay', dataset);
            this.setData({
                ['playingVideos.' + e.currentTarget.dataset.id]: true
            });
        },
        videoPause(e) {
            this.triggerEvent('WxmlVideoPause', e.currentTarget.dataset);
            this.setData({
                ['playingVideos.' + e.currentTarget.dataset.id]: false
            });
        },
        playVideo(e) {
            var dataset = e.currentTarget.dataset,
                type = dataset.type,
                id = dataset.id;
            if (type == 'video') {
                var context = wx.createVideoContext(id, this);
                context.play();
            }
            this.triggerEvent('WxmlPlayVideo', dataset);
        }
    },
    attached: function() {
        var res = wx.getSystemInfoSync();
        this.setData({
            WIN_WIDTH: res.screenWidth
        });
    }
})