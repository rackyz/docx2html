define(['./converter', './style/converter'],function(Super, Style){
	var AZ=/[A-Z]/g, 
		r=function(a){return '-'+a.toLowerCase()},
		clozed=/Z$/gi;
	function asStyle(x){
		var a=[]
		for(var i in x)
			a.push(i.replace(AZ,r)+':'+x[i])
		return a.join(';')
	}
	
	return Super.extend({
		wordType:'shape',
		tag:'div',
		convertStyle: function(el){
			el.style.position='absolute'
			var pathStyle={stroke:'black', strokeWidth:2, fillOpacity:0}
			Super.prototype.convertStyle.apply(this,arguments)
			var style=this.wordModel.getDirectStyle();
			style && style.parse([new this.constructor.Properties(el.style,this, pathStyle)])
			if(this.path){
				if(el.style.background)
					pathStyle.fillOpacity=0
				var bgImage=el.style.background,
					grad=pathStyle.grad;
				delete pathStyle.grad;				
				
				var svg='<svg xmlns="http://www.w3.org/2000/svg">'
						+(grad ? '<defs>'+grad+'</defs>' : '')
						+this.path+' style="'+asStyle(pathStyle)+'" /></svg>',
					svgImage='url(data:image/svg+xml;base64,'+btoa(svg)+')';
				el.style.background=svgImage+(bgImage ? ' ,'+bgImage :'')
				el.style.backgroundSize='100% 100%'+(bgImage ? ',100% 100%' :'')
				//el.innerHTML=svg
			}
		}
	},{
		Properties: Style.Properties.extend(function(style,parent, pathStyle){
			Style.Properties.apply(this,arguments)
			this.pathStyle=pathStyle
		},{
			xfrm: function(x){
				this.style.width=x.width+'pt'
				this.style.height=x.height+'pt'
				x.x && (this.style.left=x.x+'pt')
				x.y && (this.style.top=x.y+'pt')
				this.world=x
			},
			ln: function(x){
				x.color && (this.pathStyle.stroke=x.color);
				x.width!=undefined && (this.pathStyle.strokeWidth=x.width+'pt');
				
				switch(x.cap){
				case 'rnd':
					this.pathStyle.strokeLinecap='round'
					break
				default:
					
				}
				
				if(x.dash){
					switch(this.lineStyle(x.dash)){
					case 'dotted':
						this.pathStyle.strokeDasharray="5,5"
						break
					break
					case 'dashed':
						this.pathStyle.strokeDasharray="10,10"
					break
					}
				}
			},
			solidFill: function(x){
				this.pathStyle.fill=x
				this.pathStyle.fillOpacity=1
			},
			gradFill: function(x){
				if(this.style.backgroundImage)
					return
					
				var grad=[]
				switch(x.path){
				case 'linear':
					grad.push('<linearGradient id="grad"')
					switch(x.angel){
					case 0:
						grad.push('x1="0%" y1="0%" x2="100%" y2="0%">')
						break
					case 90:
						grad.push('x1="0%" y1="0%" x2="0%" y2="100%">')
						break
					case 180:
						grad.push('x1="100%" y1="0%" x2="0%" y2="0%">')
						break
					case 270:
						grad.push('x1="0%" y1="100%" x2="0%" y2="0%">')
						break
					}
					grad.push('</linearGradient>')
					break
				case 'circle':
					grad.push('<radialGradient  id="grad"')
					grad.push('cx="50%" cy="50%" r="50%" fx="50%" fy="50%">')
					grad.push('</radialGradient>')
					break
				}
				var end=grad.pop()
				for(var i=0,len=x.stops.length,a;i<len;i++)
					grad.push('<stop offset="'+(a=x.stops[i]).position+'%" style="stop-opacity:1;stop-color:'+a.color+'"/>')
				grad.push(end)
				
				this.pathStyle.grad=grad.join(' ')
				this.pathStyle.fill='url(#grad)'
				this.pathStyle.fillOpacity=1
			},
			blipFill: function(x){
				this.style.background='url('+this.doc.asImageURL(x)+')'
				this.style.backgroundSize='100% 100%'
				this.noFill()
			},
			noFill: function(x){
				this.pathStyle.fillOpacity=0
			},
			lnRef: function(x){
				this.ln(x)
			},
			fillRef: function(x){
				if(this.style.backgroundImage)
					return
				this.pathStyle.fill= typeof(x)=='string' ? x : x.color
				this.pathStyle.fillOpacity=1
			},
			fontRef: function(x){
				x.color && (this.style.color=x.color);
				x.family && (this.style.fontFamily=x.family);
			},
			path: function(x, t){
				switch(x.shape){
				case 'line':
					this.parent.path='<line x1="0" y1="0" x2="'+this.world.width+'pt" y2="'+this.world.height+'pt"'
					break
				case 'rect':
					this.parent.path='<rect width="'+this.world.width+'pt" height="'+this.world.height+'pt"'
					break;	
				case 'roundRect':
					this.parent.path='<rect rx="'+(t=Math.min(this.world.width, this.world.height)/12)+'pt" ry="'+t+'pt" width="'+this.world.width+'pt" height="'+this.world.height+'pt"'
					break;
				case 'ellipse':
					this.parent.path='<ellipse cx="'+this.world.width/2+'pt" cy="'+this.world.height/2+'pt" rx="'+this.world.width/2+'pt" ry="'+this.world.height/2+'pt"'
					break
				case 'path':
					this.parent.path='<path d="'+x.path+'"'
					if(!clozed.test(x.path))
						this.noFill()
					break
				}
			}
		})
	})
})