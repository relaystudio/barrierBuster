$(function(){

Backbone.View.prototype.close = function () {
    if (this.beforeClose) {
        this.beforeClose();
    }
    this.remove();
    this.unbind();
};

var itemModel = Backbone.Model.extend({

	// This model ONLY keeps track of what is passed back from the Node service, i.e. media types and info,
	// barrier type ascribed to the media, and whether or not the model is currently active (no double access);

	defaults: function() {
		return {
		_id: null
		// Name of the content piece
		, name: ""
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
		'click': 'done'
		, 'mouseenter': 'select'
		, 'mouseleave': 'deselect'
		, 'dblClick': 'active'

	}

	, initialize: function() {
		this.bind('change', this.render, this);
		this.bind('destroy', this.done, this);

		this.selectCounter = 1000; 	// Set fade counter
		this.selected = 0;			// Last time hovered
		this.playhead = 0; 			// Whenever this thing was triggered
		this.timer = 0;				// The actual timer
		this.time = 0;				// What the timer is counting
		(function(view) {
				view.timer = window.setInterval(function() { view.update(); }, 100);
			})(this);
		this.update();
	}

	, active: function(state) { // Quickly pass active or not active to the model
		if(state) {
			this.model.set('isActive',true);
		} else
		if(!state) {
			this.model.set('isActive',false);
			console.log(this.model.get("name") + " is currently active.");
		}
	}
	
	, select: function() {
		if(!this.model.isActive) {

			var currentTime = Math.round(new Date().getTime() / 1000);

			if( (currentTime - this.selected) > this.selectCounter ) {
				this.active()
			}

			
		
		}
	}

	, deselect: function() {
		console.log("deselect");

		if(!this.model.get("isActive")) {
			console.log("Decrementing");
			(function(view) {
				view.timer = window.setInterval(function() { view.decrementTimer(); }, 100);
			})(this);
		
		}
	}

	, incrementTimer: function() {
		if(this.time >= this.selectCounter) {
			(function(view) { view.timer = clearInterval(view.timer) })(this);
			this.active(true);
		} else
		if(this.time < this.selectCounter) {
			this.time += 1;	
		}
		this.update();
	}

	, decrementTimer: function() {
		if(this.time <= 0) {
			(function(view) { view.timer = clearInterval(view.timer) })(this);
		}
		this.time -= 1;
		this.update();
	}

	, contentDisplay: function() {
		if(playhead == 0) { // if the content is just starting
			(function(view) {
				view.timer = window.setInterval(function() { view.contentDisplay(); }, 1);
				})(this);
		} else
		if(playhead > this.model.get("duration")) { // If the content is finished
			clearInterval(this.timer);
			this.model.set('isActive', false);
			this.update();
		} else
		if(playhead != 0) { // if the content is in the process of "playing"
			playhead += 1;
		}
	}

	, update: function() {
		this.$el.css('width', ( ( 99	 / ItemCollection.length) ) + "%" )
		
		if(!this.model.get("isActive")) {
			this.selected = new Date().getTime() / 1000; // Unix timestampz
			this.$el.css("height", ((this.time / this.selectCounter)*100) + "%" );
		} else 
		if(this.model.get("isActive")) {
			this.$el.css('background-color', 'black');
		} else {
			

			}
		this.render();
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
		
	}

	, initialize: function() {
		_.bindAll(this, 'addOne', 'addAll');
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
		(function(view) {
				window.setInterval(function() { view.updateScene(); }, 50);
			})(this);	
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