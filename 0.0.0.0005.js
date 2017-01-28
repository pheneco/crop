//Graphene Image Cropper
//Written By Trewbot July 8, 2014

//Example:
//
//	<center><div id="crop" style="background:url('http://cdn.trinixy.ru/pics4/20100915/wooden_pc_case_63.jpg');width:478px;height:640px;position:relative;"></div></center>
//	<script src="http://api.phene.co/gra_crop-0.0.0.0005.js"></script>
//	<script>
//		var element  = document.getElementById('crop'),
//			kind     = 'cut',
//			options  = {handle_border:true},
//			crop     = new gra_crop(element, kind, options);
//		form.left    = crop.values.left;
//	</script>

var gra_crop    = function(element, kind, options) {
	if(typeof window.gra_crop_int =='undefined') {
		this.int = window.gra_crop_int = 0;
		window.gra_crop_this = [];
	} else {
		this.int = window.gra_crop_int +++ 1;
	}
	this.elem     = element;
	this.kind     = kind;
	this.y1       = this.y2 = this.y3 = this.y4 = this.y5 =
	this.x1       = this.x2 = this.x3 = this.x4 = this.x5 = 0;
	this.hw       = (typeof options.handle_width == 'number')?options.handle_width:4;
	this.hb       = (typeof options.handle_border_width == 'number')?options.handle_border_width:1;
	this.hbc      = (typeof options.handle_border_color == 'string')?options.handle_border_color:'#ddd';
	this.thb      = (typeof options.handle_border == 'boolean')?options.handle_border:false;
	this.min      = (typeof options.minimum == 'number')?options.minimum:0;
	this.shade    = (typeof options.shade == 'string')?options.shade:'rgba(0,0,0,0.35)';
	this.handle   = (typeof options.handle_color == 'string')?options.handle_color:'rgba(0,0,0,0.4)';
	this.arrow    = ['north', 'west', 'south', 'east', 'northwest', 'northeast', 'southeast', 'southwest'];
	this.rendered = false;

	this.init   = function() {
		if(kind == 'cut') {
			this.elem.style.cursor     = 'crosshair';
			this.values                = {top:0,left:0,height:0,width:0};
			this.cutting               = false;
			this.moving                = false;
			this.resize                = false;
			this.rsz_nw                = false;
			this.rsz_ne                = false;
			this.rsz_sw                = false;
			this.rsz_se                = false;
			this.y3                    = this.elem.getBoundingClientRect()['height'];
			this.x3                    = this.elem.getBoundingClientRect()['width'];
			this.square                = (typeof options.square == 'boolean')?options.square:false;
			var gra_crop_html          = '';
			for(var i = 0; i < 4; i++) gra_crop_html += '<div id="crop-div-'+this.arrow[i]+'-'+this.int+'" class="crop-div" style="cursor:crosshair;padding:0;margin:0;background:'+this.shade+';display:block;position:absolute;"></div>';
			for(var i = 4; i < 8; i++) gra_crop_html += '<div id="crop-handle-'+this.arrow[i]+'-'+this.int+'" class="crop-handle" style="cursor:'+((i%2==0)?'nw':'ne')+'-resize;padding:0;margin:0;background:'+this.handle+';display:none;position:absolute;width:'+(this.hw-this.hb)+'px;height:'+(this.hw-this.hb)+'px;border-color:'+this.hbc+';border-width:'+this.hb+';border-style:'+((this.thb)?'solid':'')+';"></div>';
			this.elem.innerHTML        = gra_crop_html;
			this.cdn                   = document.getElementById('crop-div-north-'+this.int);
			this.cdw                   = document.getElementById('crop-div-west-'+this.int);
			this.cds                   = document.getElementById('crop-div-south-'+this.int);
			this.cde                   = document.getElementById('crop-div-east-'+this.int);
			this.chnw                  = document.getElementById('crop-handle-northwest-'+this.int);
			this.chne                  = document.getElementById('crop-handle-northeast-'+this.int);
			this.chsw                  = document.getElementById('crop-handle-southwest-'+this.int);
			this.chse                  = document.getElementById('crop-handle-southeast-'+this.int);
			this.render                = function() {
				if(this.y2 - this.y1 < this.min) { this.y2 = this.y1 + this.min; }
				if(this.x2 - this.x1 < this.min) { this.x2 = this.x1 + this.min; }

				if(this.square) {
					if(this.y2 - this.y1 > this.x2 - this.x1) {
						this.x2 = this.x1 + (this.y2 - this.y1);
					} else {
						this.y2 = this.y1 + (this.x2 - this.x1);
					}
				}

				if(this.x2 > this.x3) { this.x2 = this.x3; if(this.square) this.y2 = this.x2 - this.x1 + this.y1;}
				if(this.y2 > this.y3) { this.y2 = this.y3; if(this.square) this.x2 = this.y2 - this.y1 + this.x1;}
				if(this.x1 > this.x3) { this.x1 = this.x3; if(this.square) this.y2 = this.x2 - this.x1 + this.y1;}
				if(this.y1 > this.y3) { this.y1 = this.y3; if(this.square) this.x2 = this.y2 - this.y1 + this.x1;}
				if(this.x1 < 0)       { this.x1 = 0;       if(this.square) this.y2 = this.x2 - this.x1 + this.y1;}
				if(this.y1 < 0)       { this.y1 = 0;       if(this.square) this.x2 = this.y2 - this.y1 + this.x1;}
				
				
				this.rendered          = true;

				this.cdn.style.top     = "0px";
				this.cdn.style.left    = "0px";
				this.cdn.style.height  = this.y1 + "px";
				this.cdn.style.width   = this.x3 + "px";
				
				this.cdw.style.top     = this.y1 + "px";
				this.cdw.style.left    = "0px";
				this.cdw.style.height  = this.y2 - this.y1 + "px";
				this.cdw.style.width   = this.x1 + "px";
				
				this.cde.style.top     = this.y1 + "px";
				this.cde.style.left    = this.x2 + "px";
				this.cde.style.height  = this.y2 - this.y1 + "px";
				this.cde.style.width   = this.x3 - this.x2 + "px";
				
				this.cds.style.top     = this.y2 + "px";
				this.cds.style.left    = "0px";
				this.cds.style.height  = this.y3 - this.y2 + "px";
				this.cds.style.width   = this.x3 + "px";
				
				
				this.chnw.style.top    = this.y1 - (this.hw / 2) + "px";
				this.chnw.style.left   = this.x1 - (this.hw / 2) + "px";
				this.chnw.style.display= 'block';
				
				this.chne.style.top    = this.y1 - (this.hw / 2) + "px";
				this.chne.style.left   = this.x2 - (this.hw / 2) + "px";
				this.chne.style.display= 'block';

				this.chsw.style.top    = this.y2 - (this.hw / 2) + "px";
				this.chsw.style.left   = this.x1 - (this.hw / 2) + "px";
				this.chsw.style.display= 'block';

				this.chse.style.top    = this.y2 - (this.hw / 2) + "px";
				this.chse.style.left   = this.x2 - (this.hw / 2) + "px";
				this.chse.style.display= 'block';

				
				this.values.top        = this.y1;
				this.values.left       = this.x1;
				this.values.height     = this.y2 - this.y1;
				this.values.width      = this.x2 - this.x1;
			}
			this.mouseup               = function(e) {
				this.cutting           = this.moving = this.resize = this.rsz_nw = this.rsz_ne = this.rsz_sw = this.rsz_se = false;
				this.elem.style.cursor = 'move';
				this.cdn.style.cursor  = 
				this.cde.style.cursor  = 
				this.cds.style.cursor  = 
				this.cdw.style.cursor  = 'crosshair';
			}
			this.mousedown             = function(e) {
				var tool = this.elem.getBoundingClientRect(),
					chnw = this.chnw.getBoundingClientRect(),
					chne = this.chne.getBoundingClientRect(),
					chsw = this.chsw.getBoundingClientRect(),
					chse = this.chse.getBoundingClientRect();
				if(this.checkloc(e, chnw)) {
						e.preventDefault();
						this.x4        = e.clientX - chnw['left'];
						this.y4        = e.clientY - chnw['top'];
						this.x5        = this.x2;
						this.y5        = this.y2;
						this.resize    = true;
						this.rsz_nw    = true;
				} else if(this.checkloc(e, chne)) {
						e.preventDefault();
						this.x4        = e.clientX - chne['left'];
						this.y4        = e.clientY - chne['top'];
						this.x5        = this.x1;
						this.y5        = this.y2;
						this.resize    = true;
						this.rsz_ne    = true;
				} else if(this.checkloc(e, chsw)) {
						e.preventDefault();
						this.x4        = e.clientX - chsw['left'];
						this.y4        = e.clientY - chsw['top'];
						this.x5        = this.x2;
						this.y5        = this.y1;
						this.resize    = true;
						this.rsz_sw    = true;
				} else if(this.checkloc(e, chse)) {
						e.preventDefault();
						this.x4        = e.clientX - chse['left'];
						this.y4        = e.clientY - chse['top'];
						this.x5        = this.x1;
						this.y5        = this.y1;
						this.resize    = true;
						this.rsz_se    = true;
				} else if(this.checkloc(e, tool)) {
					e.preventDefault();
					if(e.clientX > tool['left'] + this.x1 && e.clientY > tool['top'] + this.y1 && e.clientX < tool['left'] + this.x2 && e.clientY < tool['top'] + this.y2) {
						this.x4        = e.clientX - tool['left'] - this.x1;
						this.y4        = e.clientY - tool['top']  - this.y1;
						this.x5        = this.x2 - this.x1;
						this.y5        = this.y2 - this.y1;
						this.render();
						this.moving    = true;
					} else {
						this.x1        = e.clientX - tool['left'];
						this.y1        = e.clientY - tool['top'];
						this.x4        = this.x1;
						this.y4        = this.y1;
						this.x2        = this.x1 + 8;
						this.y2        = this.y1 + 8;
						this.render();
						this.cutting   = true;
					}
				}
			}
			this.checkloc       = function(e, rect) {
				return (e.clientX > rect['left'] && e.clientY > rect['top'] && e.clientX < rect['left'] + rect['width'] && e.clientY < rect['top'] + rect['height']);
			}
			this.mousemove      = function(e) {
				var tool        = this.elem.getBoundingClientRect();
				if(this.cutting) {
					this.x5     = e.clientX - tool['left'];
					this.y5     = e.clientY - tool['top'];
					if(this.x5  > this.x4 && this.y5 > this.y4) this.x1 = this.x4, this.y1 = this.y4, this.x2 = this.x5, this.y2 = this.y5;
					if(this.x5  > this.x4 && this.y5 < this.y4) this.x1 = this.x4, this.y2 = this.y4, this.x2 = this.x5, this.y1 = this.y5;
					if(this.x5  < this.x4 && this.y5 < this.y4) this.x2 = this.x4, this.y2 = this.y4, this.x1 = this.x5, this.y1 = this.y5;
					if(this.x5  < this.x4 && this.y5 > this.y4) this.x2 = this.x4, this.y1 = this.y4, this.x1 = this.x5, this.y2 = this.y5;
					this.render();
				} else if(this.moving) {
					this.x1     = e.clientX - tool['left'] - this.x4;
					this.x2     = this.x1 + this.x5;
					if(this.x2  > this.x3)
						this.x2 = this.x3, this.x1 = this.x2 - this.x5;
					if(this.x1  < 0)
						this.x1 = 0, this.x2 = this.x5;
					this.y1     = e.clientY - tool['top'] - this.y4;
					this.y2     = this.y1 + this.y5;
					if(this.y2  > this.y3)
						this.y2 = this.y3, this.y1 = this.y2 - this.y5;
					if(this.y1  < 0)
						this.y1 = 0, this.y2 = this.y5;
					this.render();
				} else if(this.resize) {
					this.x6     = e.clientX - tool['left'] + ((this.hw / 2) - this.x4);
					this.y6     = e.clientY - tool['top']  + ((this.hw / 2) - this.y4);
					if(this.rsz_nw        ||       this.rsz_se) this.elem.style.cursor = this.cdn.style.cursor = this.cde.style.cursor = this.cds.style.cursor = this.cdw.style.cursor = 'nw-resize';
					if(this.rsz_ne        ||       this.rsz_sw) this.elem.style.cursor = this.cdn.style.cursor = this.cde.style.cursor = this.cds.style.cursor = this.cdw.style.cursor = 'ne-resize';
					if(this.x6  < this.x5 && this.y6 < this.y5) this.x1 = this.x6, this.y1 = this.y6, this.x2 = this.x5, this.y2 = this.y5;
					if(this.x6  < this.x5 && this.y6 > this.y5) this.x1 = this.x6, this.y1 = this.y5, this.x2 = this.x5, this.y2 = this.y6;
					if(this.x6  > this.x5 && this.y6 > this.y5) this.x1 = this.x5, this.y1 = this.y5, this.x2 = this.x6, this.y2 = this.y6;
					if(this.x6  > this.x5 && this.y6 < this.y5) this.x1 = this.x5, this.y1 = this.y6, this.x2 = this.x6, this.y2 = this.y5;
					this.render();
				}
			}
			document.addEventListener('mouseup',   this.mouseup.bind(this));
			document.addEventListener('mousedown', this.mousedown.bind(this));
			document.addEventListener('mousemove', this.mousemove.bind(this));
		}
	}

	this.init();
};