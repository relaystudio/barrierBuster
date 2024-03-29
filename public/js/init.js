$(function(){

Backbone.View.prototype.close = function () {
    if (this.beforeClose) {
        this.beforeClose();
    }
    this.remove();
    this.unbind();
};

// Threejs Globals
var isGL = true;
var scene, renderer, camera;


// Backbone model
var itemModel = Backbone.Model.extend({

	// This model ONLY keeps track of what is passed back from the Node service, i.e. media types and info,
	// barrier type ascribed to the media, and whether or not the model is currently active (no double access);

	defaults: function() {
		return {
		_id: null
		// Name of the content piece
		, name: ""
		, path: ""
		// Duration is set by media type in millisecons, 
		//so 30sec should be represented as 30 * 1000
		, duration: 1000
		// Type of barrier, loads shader?
		, barrier: 1
		// Is this piece of content active?
		, isActive: false
		}
	}

	, initialize: function() {
	  if (!this.get("barrier")) {
		this.set({"barrier": this.defaults.barrier});
		}	
	  if (!this.get("isActive")) {
		this.set({"isActive": this.defaults.isActive});
		}
	}
	, toggle: function() {
//      this.save({done: !this.get("done")});
	}
	, validate: function(attrs) {
		
	}
	, setActive: function(active) {
		this.set({"isActive": isActive});
	}

});

var itemCollection = Backbone.Collection.extend({
	
	model: itemModel
	
	, localStorage: new Backbone.LocalStorage("barrier-backbone")

	, initialize: function () {

	}
	, comparator: function(item) {
	return item.get('_id');
	}

}); 	

var ItemCollection = new itemCollection;

//  ItemCollection.create({
// 	 	_id: 0
// 	 	, name: "Test1"
// 	 	, duration: 1000
// 	 	, barrier: 1
// 	 	, isActive: false
//  	}
//  	, {
// 	 	_id: 0
// 	 	, name: "Test1"
// 	 	, duration: 1000
// 	 	, barrier: 1
// 	 	, isActive: false
//  	}
// )

/************************************************************
		Primary title view (Living identity?)
************************************************************/
var itemEntryView = Backbone.View.extend({
		el: $('#itemEntryAnchor')
		, template: _.template($('#itemEntryTemplate').html())
		, events: {
			'click #submit' : 'saveOnClick'
			, 'keypress .next' : 'saveOnEnter'
			, 'keypress .next' : 'focusNext'
			, 'click .cancel' : 'done'
		}
		
		, initialize: function() {
//			$el.html(this.template);
			console.log('Triggering itemEntryView');
			$.ajax({
				url: './filelist'
				, success: function(data) {
					for(var key in data){
						$('select#path').append('<option>' + data[key] + '</option>');
					}
				}
				, 
			})
			this.$el.html(this.template);
		}
		, saveOnClick: function(e) {
			this.save();
			}
		, saveOnEnter: function(e) {
			if(e.keyCode == 27);
				this.done();
			if(e.keyCode !== 13) return;
			this.save();
		}
		, save: function() {
			// I need to put some validating methods here before passing off

			newEntry = {
				_id: 0
				, name: $('input#name').val()
				, path: $('input#path').val()
				, duration: 1000
				, barrier: $('input#barrierType').val()
				, isActive: false
			}
			ItemCollection.create(newEntry);
			this.done();
		
		}
		, focusNext: function(e) {
			if(e.keyCode == 13)
				$(this).next().focus();
			else if(e.keyCode == 27);
				this.done();
		}
		, done: function() {
			$(this.el).slideUp(100);
		}
	})



/************************************************************
		Primary title view (Living identity?)
************************************************************/
var titleView = Backbone.View.extend({
	el: $('#livingIdentity')
	, template: _.template($("#livingIdentityTemplate").html())
	, events: {
		'click': 'cycle'
	}

	, initialize: function() {
		
	}
	
	, cycle: function() {
		return this;
	}

	, render: function() {
	  	$(this.el).html(this.template);
		return this;
	}
	, done: function() {

	}
});

/************************************************************
		Individual items
************************************************************/
var itemView = Backbone.View.extend({

	//el: $('#itemWrapper')
	tagName: 'li'
	, className: 'barrierItem'
	, template: _.template($("#itemTemplate").html())
	, events: {
		'click': 'tease'
		, 'mouseenter': 'select'
		, 'mouseleave': 'deselect'
		, 'dblClick': 'active'

	}

	, initialize: function() {
		this.bind('change', this.render, this);
		this.bind('destroy', this.done, this);

		this.selectCounter = 400; 	// Activation counter
		this.timerDirection = 0;	// 0 nothing, 1 up, -1 down
		this.playhead = 0; 			// Whenever this thing was triggered
		this.timer = 0;				// The actual timer
		this.time = 0;				// What the timer is counting

		(function(view) {
				view.timer = window.setInterval(function() { view.update(); }, 1);
			})(this);

		if(isGL)
			this.glInit();
		this.update();
	}

	, glInit: function() {

	}

	, active: function(state) { // Quickly pass active or not active to the model
		if(state) {
			this.model.set('isActive',true);
		} else
		if(!state) {
			this.model.set('isActive',false);
		}
	}

	, tease: function() { // Poor placeholder for attractor
		if(isGL)
			//this.$el.
		else
			this.$el.slideUp(100).slideDown(20).slideUp(100).slideDown(100);
	}

	, glTease: function() {

	}
	
	, select: function() {
		console.log("select " + this.model.get("name"));
		this.timerDirection = 1;
	}

	, deselect: function() {
		console.log("deselect " + this.model.get("name"));
		if(this.time >= 0) {
			this.timerDirection = -1;
		}
	}

	, update: function() { // This handles all update stuff and runs every 50-100ms
		
		// Width of the object in relation to the rest of the collection
		if(isGL)

		else
			this.$el.css('width', ( ( 99 / ItemCollection.length) ) + "%" )

		// If not active
		if(!this.model.get("isActive")) {

			if(this.time < 0) {
				this.timerDirection = 0;
				this.time = 0;
			} else
			if(this.time >= this.selectCounter) {
				this.timerDirection = this.playhead = 0; // Stop the timer and setup playhead
				this.active(true);
			}


			if(this.timerDirection == 1) {
				this.time += 1;	
			} else 
			if(this.timerDirection == -1) {
				this.time -= 1;
			}
		} else

		// If active
		if(this.model.get("isActive")) {
			if(this.playhead == 0) { // if the content is just starting, say "Start"
				this.playhead = 1;
				console.log("Starting playhead");
			} else
			if(this.playhead >= this.model.get("duration")) { // If the content is finished, i.e. over duration
				console.log(this.model.get("name") + " done playing, reverting")
				this.active(false); // Set active to false
				this.time = this.selectCounter-1; // Fully activated, ready to revert
				this.timerDirection = -1; // Revert direction
			} else
			if(this.playhead >= 1) { // if the content is in the process of "playing," increment
				this.playhead += 1; 
				console.log("Playing");
			}
		}

		// Handling the animation at the end
		if(!this.model.get("isActive")) {
			this.$el.css('background-color', 'rgba(255,200,200,1)');
			this.$el.css("height", ((this.time / this.selectCounter) * 100) + "%" );
			this.$el.css("padding-top",'0');
		} else 
		if(this.model.get("isActive")) {
			this.$el.css('background-color', 'black');
			this.$el.css('padding-top', ((this.playhead / this.model.get("duration"))*10) + "%");
		} 
	}

	, render: function() {
		//console.log('Rendering' + this.model.get("name"));
		this.$el.html(this.template(this.model.toJSON()));
		return this;
 	
	}
	, done: function() {

	}
})

/************************************************************
		Application view manager
************************************************************/
var AppView = Backbone.View.extend({
	el: $("#content")
	
	, events: {
		'keyup' : 'debug'
	}

	, initialize: function() {
		// Declare elements
	    var camera, scene, renderer;
	    var geometry, material, mesh;

		_.bindAll(this, 'addOne', 'addAll');
		_.bindAll(this);
		$(document).bind('keyup', this.debug);
		ItemCollection.bind('add', this.addOne, this);
		ItemCollection.bind('reset', this.addAll, this);
		ItemCollection.bind('all', this.render, this);
		ItemCollection.bind('refresh', this.render, this);
		ItemCollection.fetch( {
			success: function(model, response) {
				console.log('Returned collection' + JSON.stringify(model));
			}
			, error: function(model, response) {
				console.log('Error' + JSON.stringify(model) + " err: " + JSON.stringify(response));
			}
		});
		// Setting up the scene timer
		(function(view) {
				window.setInterval(function() { view.updateScene(); }, 50);
			})(this);	

		// Setting up the threejs context
		this.glInit();

	}

	, glInit: function() {

		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.z = 1000;

		scene = new THREE.Scene();

		renderer = new THREE.CanvasRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		geometry = new THREE.CubeGeometry( 200, 200, 200 );
		material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

		mesh = new THREE.Mesh( geometry, material );
		scene.add( mesh );

		document.body.appendChild( renderer.domElement );

	}

	, glUpdate: function() {
        requestAnimationFrame( animate );        
	}

	, glRender: function() {
		renderer.render( scene, camera );
	}

	, debug: function(e) {
		console.log('Triggering debug');
		if(e.keyCode == 65) { // a
			if(!this.itemEntryView)
				this.ItemEntryView = new itemEntryView();
			else {
				this.ItemEntryView.initialize();
			}
		}
	}

	, updateScene: function() {
		for(var key in ItemCollection) {
			if(ItemCollection[key].isActive == true) {

			}
		}
	}

	, detectPresence: function(location) {
		if( mousemove() ) { // placeholder for desktop, change state to desktop

		} else
		if( cujsMove ) { // placeholder for cujs, change state to public

		} else
		if( touchMove ) { // placeholder for touch, change state to mobile

		} else {
			// assume some kind of screen and play attract loop.
		}
	}
	
	, addOne: function(item, iter) {
		var view = new itemView({model: item});
		$('ul#itemWrapper').prepend(view.render().el);
		console.log('view Rendered: ' + JSON.stringify(view.model.toJSON()));
	}
	
	, addAll: function() {
	  ItemCollection.each(this.addOne, true);
	}

	, resetCollection: function() {

	}
	, render: function() {
		console.log('Rendering AppView');
		return this;
	}
});
	
var app = new AppView();
});