//Graphene Image Cropper
//Written By Trewbot July 11, 2014

//	Kinds:
//		cut						object		regular drag-to-select cropping
//		frame					object		drag inside a pre-sized frame

//	Options:
//		extra_handles			boolean		toggle cardinal handles (no effect when square:true)			cut
//		handle_width			number		width of resize handles											cut
//		handle_color			string		color of resize handles											cut
//		handle_border			boolean		toggles borders on resize handles								cut
//		handle_border_width		number		width of borders on resize handles								cut
//		handle_border_color		string		color of borders on resize handles								cut
//		minimum					number		minimum width and/or height of crop								cut
//		shade					string		color of unselected area										cut
//		square					boolean		toggles square selection										cut
//		preset					object		an object containing preset values to crop						cut
//			left				number		left preset value												cut
//			width				number		width preset value												cut
//			top					number		top preset value												cut
//			height				number		height preset value												cut
//		frame					object		the size of the frame to crop the image in						frame
//			width				number		the width of the frame											frame
//			height				number		the height of the frame											frame
//		bleed					boolean		toggles showing bled image										frame
//		bleed_width				number		max width of bleed (infinite when not set)						frame
//		bleed_opacity			number		opacity of bled image											frame
//		force_width				boolean		resizes the image to the width of the frame*					frame
//		force_height			boolean		resizes the image to the height of the frame* **				frame

//	Functions:
//		this.getValues()		object		returns an object containing the crop values					cut

//	Events: (non-IE compatible)
//		crop					event		fired whenever a cropping action is finished					cut
//		set						event		fired whenever a set action occurs								cut
//		resize					event		fired whenever a resize action occurs							cut
//		move					event		fired whenever a move action occurs								cut, frame
//		move					event		fired at each mousemove event during a move action				frame

//	Notes:
//		*	returns getValues() for unresized image with same crop area
//		**	overridden if force_width:true

var gra_crop    = function(element, image, kind, options) {
	if(typeof window.gra_crop_int =='undefined') this.int = window.gra_crop_int = 0, window.gra_crop_this = [];
	else this.int = window.gra_crop_int +++ 1;
	if(typeof image !== 'string') return false;
	this.elem     = element;
	this.kind     = kind;
	this.img      = new Image();
	this.img.src  = image;
	this.y1       = this.y2 = this.y3 = this.y4 = this.y5 =
	this.x1       = this.x2 = this.x3 = this.x4 = this.x5 = 0;
	this.rendered = false;
	if(!this.thb) this.hb = 0;
	
	this.load = function() {
		if(kind == 'cut') {
			this.elem.style.width      = this.img.width + "px";
			this.elem.style.height     = this.img.height + "px";
			this.elem.style.position   = 'relative';
			this.elem.style.background = 'url('+this.img.src+')';
		} else if(kind == 'frame') {
			this.elem.style.width      = options.frame.width + "px";
			this.elem.style.height     = options.frame.height + "px";
			this.elem.style.position   = 'relative';
			this.elem.style.background = 'url('+this.img.src+')';
			
		}
		this.init();
	}
	this.img.onload = this.load.bind(this);
	
	this.init   = function() {
		if(kind == 'cut') {
			this.eh                    = (typeof options.extra_handles == 'boolean')?options.extra_handles:false;
			this.handle                = (typeof options.handle_color == 'string')?options.handle_color:'rgba(0,0,0,0.4)';
			this.hw                    = (typeof options.handle_width == 'number')?options.handle_width:8;
			this.hb                    = (typeof options.handle_border_width == 'number')?options.handle_border_width:(typeof options.handle_border == 'boolean' && options.handle_border)?1:0;
			this.hbc                   = (typeof options.handle_border_color == 'string')?options.handle_border_color:'#ddd';
			this.thb                   = (typeof options.handle_border == 'boolean')?options.handle_border:false;
			this.min                   = (typeof options.minimum == 'number')?options.minimum:0;
			this.shade                 = (typeof options.shade == 'string')?options.shade:'rgba(0,0,0,0.35)';
			this.arrow                 = ['north', 'west', 'south', 'east', 'northwest', 'northeast', 'southeast', 'southwest'];
			this.elem.style.cursor     = 'crosshair';
			this.values                = {top:0,left:0,height:0,width:0};
			this.cutting               = false;
			this.moving                = false;
			this.resize                = false;
			this.linear                = false;
			this.rsz_ns                = false;
			this.rsz_ew                = false;
			this.rsz_nw                = false;
			this.rsz_ne                = false;
			this.rsz_sw                = false;
			this.rsz_se                = false;
			this.y3                    = this.elem.getBoundingClientRect()['height'];
			this.x3                    = this.elem.getBoundingClientRect()['width'];
			this.square                = (typeof options.square == 'boolean')?options.square:false;
			var gra_crop_html          = '';
			for(var i = 0; i < 4; i++) gra_crop_html += '<div id="crop-div-'+this.arrow[i]+'-'+this.int+'" class="crop-div" style="cursor:crosshair;padding:0;margin:0;background:'+this.shade+';display:block;position:absolute;"></div>';
			for(var i = ((!this.square && this.eh)?0:4); i < 8; i++) gra_crop_html += '<div id="crop-handle-'+this.arrow[i]+'-'+this.int+'" class="crop-handle" style="cursor:'+((i<4)?((i%2==0)?'ns':'ew'):((i%2==0)?'nw':'ne'))+'-resize;padding:0;margin:0;background:'+this.handle+';display:none;position:absolute;width:'+(this.hw-(this.hb*2))+'px;height:'+(this.hw-(this.hb*2))+'px;border-color:'+this.hbc+';border-width:'+this.hb+';border-style:'+((this.thb)?'solid':'')+';"></div>';
			this.elem.innerHTML        = gra_crop_html;
			this.cdn                   = document.getElementById('crop-div-north-'+this.int);
			this.cdw                   = document.getElementById('crop-div-west-'+this.int);
			this.cds                   = document.getElementById('crop-div-south-'+this.int);
			this.cde                   = document.getElementById('crop-div-east-'+this.int);
			if(!this.square && this.eh) {
				this.chn               = document.getElementById('crop-handle-north-'+this.int);
				this.chw               = document.getElementById('crop-handle-west-'+this.int);
				this.chs               = document.getElementById('crop-handle-south-'+this.int);
				this.che               = document.getElementById('crop-handle-east-'+this.int);
			}
			this.chnw                  = document.getElementById('crop-handle-northwest-'+this.int);
			this.chne                  = document.getElementById('crop-handle-northeast-'+this.int);
			this.chsw                  = document.getElementById('crop-handle-southwest-'+this.int);
			this.chse                  = document.getElementById('crop-handle-southeast-'+this.int);
			this.getValues             = function() {
				return {
					left               : this.x1,
					width              : this.x2 - this.x1,
					top                : this.y1,
					height             : this.y2 - this.y1
				};
			}
			this.sendEvent             = function(kind) {
				var generic            = {
					cropper            : this.int,
					left               : this.x1,
					width              : this.x2 - this.x1,
					top                : this.y1,
					height             : this.y2 - this.y1
				}
				if(kind=='crop' || kind=='set' || kind=='resize' || kind=='move') {
					var event          = new CustomEvent(kind, {
						detail         : generic
					});
					window.dispatchEvent(event);
				}
			}
			this.render                = function() {
				if(this.y2 - this.y1 < this.min) { this.y2 = this.y1 + this.min; }
				if(this.x2 - this.x1 < this.min) { this.x2 = this.x1 + this.min; }

				if(this.square) {if(this.y2 - this.y1 < this.x2 - this.x1) {this.squareX();} else {this.squareY();}}
				
				if(this.x2 > this.x3) { this.x2 = this.x3; this.squareY();}
				if(this.y2 > this.y3) { this.y2 = this.y3; this.squareX();}
				if(this.x1 > this.x3) { this.x1 = this.x3; this.squareY();}
				if(this.y1 > this.y3) { this.y1 = this.y3; this.squareX();}
				if(this.x1 < 0)       { this.x1 = 0;       this.squareY();}
				if(this.y1 < 0)       { this.y1 = 0;       this.squareX();}
				if(this.x2 < 0)       { this.x2 = 0;       this.squareY();}
				if(this.y2 < 0)       { this.y2 = 0;       this.squareX();}
				if(this.x2 < this.x1) { this.x2 = this.x1; this.squareY();}
				if(this.y2 < this.y1) { this.y2 = this.y1; this.squareX();}
				
				
				this.rendered          = true;

				this.cdn.style.top     = "0px";
				this.cdn.style.left    = "0px";
				this.cdn.style.height  = this.y1 + "px";
				this.cdn.style.width   = this.x3 + "px";
				this.cdn.style.backgroundPositionX = "0px";
				this.cdn.style.backgroundPositionY = "0px";
				
				this.cdw.style.top     = this.y1 + "px";
				this.cdw.style.left    = "0px";
				this.cdw.style.height  = this.y2 - this.y1 + "px";
				this.cdw.style.width   = this.x1 + "px";
				this.cdw.style.backgroundPositionX = "0px";
				this.cdw.style.backgroundPositionY = - this.y1 + "px";
				
				this.cde.style.top     = this.y1 + "px";
				this.cde.style.left    = this.x2 + "px";
				this.cde.style.height  = this.y2 - this.y1 + "px";
				this.cde.style.width   = this.x3 - this.x2 + "px";
				this.cde.style.backgroundPositionX = - this.x2 + "px";
				this.cde.style.backgroundPositionY = - this.y1 + "px";
				
				this.cds.style.top     = this.y2 + "px";
				this.cds.style.left    = "0px";
				this.cds.style.height  = this.y3 - this.y2 + "px";
				this.cds.style.width   = this.x3 + "px";
				this.cds.style.backgroundPositionX = "0px";
				this.cds.style.backgroundPositionY = - this.y2 + "px";
				
				
				if(!this.square && this.eh){
				this.chn.style.top     = this.y1 - (this.hw / 2) + "px";
				this.chn.style.left    = this.x1 + ((this.x2 - this.x1) / 2) - (this.hw / 2) + "px";
				this.chn.style.display = 'block';

				this.chw.style.top     = this.y1 + ((this.y2 - this.y1) / 2) - (this.hw / 2) + "px";
				this.chw.style.left    = this.x1 - (this.hw / 2) + "px";
				this.chw.style.display = 'block';

				this.chs.style.top     = this.y2 - (this.hw / 2) + "px";
				this.chs.style.left    = this.x1 + ((this.x2 - this.x1) / 2) - (this.hw / 2) + "px";
				this.chs.style.display = 'block';

				this.che.style.top     = this.y1 + ((this.y2 - this.y1) / 2) - (this.hw / 2) + "px";
				this.che.style.left    = this.x2 - (this.hw / 2) + "px";
				this.che.style.display = 'block';
				}
				
				
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
				if(this.cutting || this.moving || this.resize || this.linear) {
				this.elem.style.cursor = 'move';
				this.cdn.style.cursor  = 
				this.cde.style.cursor  = 
				this.cds.style.cursor  = 
				this.cdw.style.cursor  = 'crosshair';
				this.sendEvent('crop');
				}
				if(this.cutting) this.sendEvent('set');
				if(this.resize || this.linear) this.sendEvent('resize');
				if(this.moving) this.sendEvent('move');
				this.cutting           = this.moving = this.linear = this.resize = this.rsz_ns = this.rsz_ew = this.rsz_nw = this.rsz_ne = this.rsz_sw = this.rsz_se = false;
			}
			this.mousedown             = function(e) {
				var tool = this.elem.getBoundingClientRect(),
					chnw = this.chnw.getBoundingClientRect(),
					chne = this.chne.getBoundingClientRect(),
					chsw = this.chsw.getBoundingClientRect(),
					chse = this.chse.getBoundingClientRect();
				if(this.eh) {
					var
					chn  = this.chn.getBoundingClientRect(),
					chw  = this.chw.getBoundingClientRect(),
					chs  = this.chs.getBoundingClientRect(),
					che  = this.che.getBoundingClientRect();
				}
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
				} else if(this.eh && this.checkloc(e, chn)) {
						e.preventDefault();
						this.y4        = e.clientY - chn['top'];
						this.y5        = this.y2;
						this.linear    = true;
						this.rsz_ns    = true;
				} else if(this.eh && this.checkloc(e, chw)) {
						e.preventDefault();
						this.x4        = e.clientX - chw['left'];
						this.x5        = this.x2;
						this.linear    = true;
						this.rsz_ew    = true;
				} else if(this.eh && this.checkloc(e, chs)) {
						e.preventDefault();
						this.y4        = e.clientY - chs['top'];
						this.y5        = this.y1;
						this.linear    = true;
						this.rsz_ns    = true;
				} else if(this.eh && this.checkloc(e, che)) {
						e.preventDefault();
						this.x4        = e.clientX - che['left'];
						this.x5        = this.x1;
						this.linear    = true;
						this.rsz_ew    = true;
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
				return (rect && (e.clientX > rect['left'] && e.clientY > rect['top'] && e.clientX < rect['left'] + rect['width'] && e.clientY < rect['top'] + rect['height']));
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
					if(this.x6  < this.x5 && this.y6 < this.y5) this.x1 = this.x6, this.y1 = this.y6, this.x2 = this.x5, this.y2 = this.y5; //NW
					if(this.x6  < this.x5 && this.y6 > this.y5) this.x1 = this.x6, this.y1 = this.y5, this.x2 = this.x5, this.y2 = this.y6; //SW
					if(this.x6  > this.x5 && this.y6 > this.y5) this.x1 = this.x5, this.y1 = this.y5, this.x2 = this.x6, this.y2 = this.y6; //SE
					if(this.x6  > this.x5 && this.y6 < this.y5) this.x1 = this.x5, this.y1 = this.y6, this.x2 = this.x6, this.y2 = this.y5; //NE
					this.render();
				} else if(this.linear) {
					if(this.rsz_ns) {
						this.elem.style.cursor = this.cdn.style.cursor = this.cde.style.cursor = this.cds.style.cursor = this.cdw.style.cursor = 'ns-resize';
						this.y6     = e.clientY - tool['top']  + ((this.hw / 2) - this.y4);
						if(this.y6 > this.y5) this.y1 = this.y5, this.y2 = this.y6;
						if(this.y6 < this.y5) this.y1 = this.y6, this.y2 = this.y5;
					} else if(this.rsz_ew) {
						this.elem.style.cursor = this.cdn.style.cursor = this.cde.style.cursor = this.cds.style.cursor = this.cdw.style.cursor = 'ew-resize';
						this.x6     = e.clientX - tool['left'] + ((this.hw / 2) - this.x4);
						if(this.x6 > this.x5) this.x1 = this.x5, this.x2 = this.x6;
						if(this.x6 < this.x5) this.x1 = this.x6, this.x2 = this.x5;
					}
					this.render();
				}
			}
			this.squareY = function() {
				if(this.square) {
					if((this.cutting && ((this.x5  > this.x4 && this.y5 > this.y4) || (this.x5  < this.x4 && this.y5 > this.y4))) || (this.resize && ((this.x6 < this.x5 && this.y6 > this.y5) || (this.x6 > this.x5 && this.y6 > this.y5)))) this.y2 = this.y1 + (this.x2 - this.x1);
					if((this.cutting && ((this.x5  > this.x4 && this.y5 < this.y4) || (this.x5  < this.x4 && this.y5 < this.y4))) || (this.resize && ((this.x6 < this.x5 && this.y6 < this.y5) || (this.x6 > this.x5 && this.y6 < this.y5)))) this.y1 = this.y2 - (this.x2 - this.x1);
				}
			}
			this.squareX = function() {
				if(this.square) {
					if((this.cutting && ((this.x5  > this.x4 && this.y5 > this.y4) || (this.x5  > this.x4 && this.y5 < this.y4))) || (this.resize && ((this.x6  > this.x5 && this.y6 > this.y5) || (this.x6 > this.x5 && this.y6 < this.y5)))) this.x2 = this.x1 + (this.y2 - this.y1);
					if((this.cutting && ((this.x5  < this.x4 && this.y5 < this.y4) || (this.x5  < this.x4 && this.y5 > this.y4))) || (this.resize && ((this.x6  < this.x5 && this.y6 < this.y5) || (this.x6 < this.x5 && this.y6 > this.y5)))) this.x1 = this.x2 - (this.y2 - this.y1);
				}
			}
			document.addEventListener('mouseup',   this.mouseup.bind(this));
			document.addEventListener('mousedown', this.mousedown.bind(this));
			document.addEventListener('mousemove', this.mousemove.bind(this));
			this.cropTo = function(crop) {
				if(!(typeof crop == 'object' && typeof crop.left == 'number'&& typeof crop.width == 'number'&& typeof crop.top == 'number'&& typeof crop.height == 'number')) return false;
				this.x1 = crop.left;
				this.x2 = crop.left + crop.width;
				this.y1 = crop.top;
				this.y2 = crop.top + crop.height;
				this.render();
			}
			
			if(typeof options.preset == 'object' && typeof options.preset.left == 'number' && typeof options.preset.width == 'number' && typeof options.preset.top == 'number' && typeof options.preset.height == 'number') {
				this.x1 = options.preset.left;
				this.x2 = options.preset.left + options.preset.width;
				this.y1 = options.preset.top;
				this.y2 = options.preset.top + options.preset.height;
				this.elem.style.cursor = 'move';
				this.render();
			}
		}
		else if(kind == 'frame') {
			if(typeof options.frame.width    !== 'number' || typeof options.frame.height !== 'number') {console.error("Frame undefined!"); return false};
			this.force_width           = (typeof options.force_width == 'boolean')?options.force_width:false;
			this.force_height          = (typeof options.force_height == 'boolean')?options.force_height:false;
			this.moving                = false;
			this.x1                    = (typeof options.preset == 'object' && typeof options.preset.left == 'number')?options.preset.left:0;
			this.y1                    = (typeof options.preset == 'object' && typeof options.preset.top == 'number')?options.preset.top:0;
			this.x2                    = this.x1 + options.frame.width;
			this.y2                    = this.y1 + options.frame.height;
			this.x3                    = (this.force_width)?options.frame.width:(this.force_height)?(options.frame.height/this.img.height)*this.img.width:this.img.width;
			this.y3                    = (this.force_width)?(options.frame.width/this.img.width)*this.img.height:(this.force_height)?options.frame.height:this.img.width;
			this.force_width           = (typeof options.force_width == 'boolean')?options.force_width:false;
			this.force_height          = (typeof options.force_height == 'boolean')?options.force_height:false;
			this.bleed                 = (typeof options.bleed == 'boolean')?options.bleed:false;
			this.bleed_width           = (typeof options.bleed_width == 'number')?options.bleed_width:0;
			this.bleed_opacity         = (typeof options.bleed_opacity == 'number')?options.bleed_opacity:0.3;
			if(this.bleed) {
				var ghost = '<div class="crop-ghost" style="top:-'+this.bleed_width+'px;left:-'+this.bleed_width+'px;width:'+(options.frame.width+(2*this.bleed_width))+'px;height:'+(options.frame.height+(2*this.bleed_width))+'px;'+ ((typeof options.bleed_width == 'number')?'overflow:hidden;':'')+'opacity:'+this.bleed_opacity+';position:absolute;"><img class="crop-ghost-img" src="'+this.img.src+'" style="position:absolute;overflow:hidden;top:'+(this.y1 + this.bleed_width)+'px;left:'+(this.x1 + this.bleed_width)+'px;"/></div><div style="position:absolute;width:'+options.frame.width+'px;height:'+options.frame.height+'px;top:0;left:0;cursor:move;"></div>';
				this.elem.insertAdjacentHTML('afterbegin', ghost);
				this.ghost = this.elem.getElementsByClassName('crop-ghost-img')[0];
			} else {
				this.elem.style.cursor = 'move';
			}
			if(this.force_width) {this.elem.style.backgroundSize = options.frame.width + "px auto"; if(this.bleed) this.ghost.style.width = options.frame.width + "px";}
			else if(this.force_height) {this.elem.style.backgroundSize = "auto " + options.frame.height + "px"; if(this.bleed) this.ghost.style.height = options.frame.height + "px";}
			
			this.getValues             = function() {
				var ret = {
					left: - this.x1,
					width: this.x2 + this.x1,
					top: - this.y1,
					height: this.y2 + this.y1
				}
				if(this.force_width) {
					var ratio  = this.img.width  / options.frame.width;
					ret.left  *= ratio;
					ret.width *= ratio;
					ret.top   *= ratio;
					ret.height*= ratio;
				} else if(this.force_height) {
					var ratio  = this.img.height / options.frame.height;
					ret.left  *= ratio;
					ret.width *= ratio;
					ret.top   *= ratio;
					ret.height*= ratio;
				}
				return ret;
			}
			this.sendEvent             = function(kind) {
				var vals               = this.getValues(),
					generic            = {
					cropper            : this.int,
					left               : vals.left,
					width              : vals.width,
					top                : vals.top,
					height             : vals.height
				}
				if(kind=='move' || kind=='moving') {
					var event          = new CustomEvent(kind, {
						detail         : generic
					});
					window.dispatchEvent(event);
				}
			}
			this.render                = function() {
				this.elem.style.backgroundPosition  = this.x1 + "px " + this.y1 + "px";
				if(this.bleed) {
					this.ghost.style.left = this.x1 + this.bleed_width + "px";
					this.ghost.style.top  = this.y1 + this.bleed_width + "px";
				}
			}
			this.mouseup               = function(e) {
				if(this.moving)          this.sendEvent("move");
				this.moving            = false;
				if(this.bleed)           this.ghost.parentElement.style.cursor = '';
			}
			this.mousedown             = function(e) {
				var rect               = this.elem.getBoundingClientRect();
				if(rect && (e.clientX  > rect['left'] && e.clientY > rect['top'] && e.clientX < rect['left'] + rect['width'] && e.clientY < rect['top'] + rect['height'])) {
					e.preventDefault();
					this.x4            = e.clientX - rect['left'] - this.x1;
					this.y4            = e.clientY - rect['top']  - this.y1;
					this.x5            = options.frame.width;
					this.y5            = options.frame.height;
					this.moving        = true;
					if(this.bleed) this.ghost.parentElement.style.cursor = 'move';
					this.render();
				}
			}
			this.mousemove             = function(e) {
				if(this.moving) {
					this.sendEvent("moving")
					var tool    = this.elem.getBoundingClientRect();
					this.x1     = e.clientX - tool['left'] - this.x4;
					this.x2     = this.x5 - this.x1;
					if(this.x2  > this.x3)
						this.x2 = this.x3, this.x1 = this.x5 - this.x2;
					if(this.x1  > 0)
						this.x1 = 0, this.x2 = this.x5;
					this.y1     = e.clientY - tool['top'] - this.y4;
					this.y2     = this.y5 - this.y1;
					if(this.y2  > this.y3)
						this.y2 = this.y3, this.y1 = this.y5 - this.y2;
					if(this.y1  > 0)
						this.y1 = 0, this.y2 = this.y5;
					this.render();
				}
			}
			document.addEventListener('mouseup',   this.mouseup.bind(this));
			document.addEventListener('mousedown', this.mousedown.bind(this));
			document.addEventListener('mousemove', this.mousemove.bind(this));
		}
	}
};