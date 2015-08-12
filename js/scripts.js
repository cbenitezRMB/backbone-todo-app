var App = (function(){
	"use strict";
	var App = {
		Models: {},
		Collections: {},
		Views: {},
		Router:{},
		vent: {},
		config: {
			localStorageName: 'todosTest1'
		}
	};

	var tasks, tasksListFromLocalStorage;
	var Button = function(config){
		var c = config;
		var el = '';
		var conf = {
			classNames: 'btn',
			id: 'myButton',
			text: 'Button',
			type: 'button'
		};
		var render = function(){
			el = '<button type="'+conf.type+'" class="'+conf.classNames+'" id="'+conf.id+'">'+conf.text+'</button>';
			return el;
		}
		if(config){
			for(var prop in config){
				if(conf.hasOwnProperty(prop)){
					conf[prop] = config[prop];
				}
			}
		}
		return render();
	};

	var domElement = function(config){
		var conf = {
			tag: 'div',
			id: '',
			classes: ''
		};

		if(config){
			for(var prop in config){
				if(conf.hasOwnProperty(prop)){
					conf[prop] = config[prop];
				}
			}
		}

		var render = function(){
			var myElement = $('<'+conf.tag+'><'+conf.tag+'/>').attr("id", conf.id).addClass(conf.classes);
			return myElement;
		}

		return render();
	};

	App.vent = _.extend({}, Backbone.Events);

	App.Router.Tasks = Backbone.Router.extend({
		routes: {
			'':'home',
			'home':'home',
			'task-details/(:taskId)': 'showTaskDetails',
			'*notFound': 'home'
		},
		home: function(){
			App.vent.trigger('tasks-list');
			App.vent.trigger('task-details:hide');
		},
		showTaskDetails: function(param){
			App.vent.trigger('task-details:show', param);
		}
	});

	App.Models.Task = Backbone.Model.extend({
		defaults: {
			title: 'No title',
			priority: 0,
			done: false,
			description: 'No description added'
		},
		
		url: '/data/tasks.json'
	});

	App.Collections.Tasks = Backbone.Collection.extend({
		model: App.Models.Task,
		url: 'data/tasks.json'
	});

	App.Views.Task = Backbone.View.extend({
		tagName: 'li',
		className: 'col-sm-12',
		events: {
			'click #edit': 'editTask',
			'click #delete': 'deleteTaskFromCollection',
			'click input[type="checkbox"]': 'check'
		},
		template: '#individual-task',
		initialize: function(){
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.removeTaskFromView);
			this.editButton = Button({
				classNames: 'btn btn-warning',
				id: 'edit',
				text: 'edit'
			});
			this.deleteButton = Button({
				classNames: 'btn btn-danger',
				id: 'delete',
				text: 'delete'
			});

		},
		render: function(index){
			var badge = '<span class="badge">'+index+'</span>  ',
				titleHtml = this.model.get('title'),
				checkbox = '<input type="checkbox" class="pull-left" >',
				details = '<a class="btn" href="#task-details/'+index+'">Details</a>';
			if(this.model.get('done')){
				badge = '<span style="background-color: green;" class="badge">'+index+'</span>  ';
				titleHtml = '<strike>'+this.model.get('title')+'</strike>';
				checkbox = '<input type="checkbox" class="pull-left" checked >';
			}
			// set new properties to new object for template context
			var templateContext = this.model.toJSON();
			templateContext.badge = badge;
			templateContext.index = index;
			templateContext.titleHtml = titleHtml;
			templateContext.checkbox = checkbox;

			var templateSource = $(this.template).html();
			var templateCompiled = Handlebars.compile(templateSource);
			var templateResult = templateCompiled(templateContext);
			this.$el.html(templateResult);
			this.$el.css({
				'float': 'left',
				'marginBottom': 15,
				'paddingLeft': 0,
				'listStyleType': 'none'
			});
			
			return this;
		},
		editTask: function(){
			this.removeErrorMessage();
			var newTitle = prompt('What would you like to change the text to?', this.model.get('title'));
			if(!$.trim(newTitle)){
				this.throwError('Enter a title for the task');
				return;
			}
			if(newTitle.length<4){
				this.throwError('Task title is too short. Min 4 characters');
				return;
			}
			this.model.set('title', newTitle)
		},
		deleteTaskFromCollection: function(){
			var deleteDecision = confirm("Delete '"+this.model.get('title')+"' task.\nAre you sure?");
			if(deleteDecision)
				this.model.destroy();
		},
		removeTaskFromView: function(){
			this.$el.remove();
		},
		throwError: function(errorMsg){
			var errorContent2 = new domElement({
				classes: 'alert alert-danger'
			});
			var errorContent = '<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">Error:</span>   '+errorMsg+'</div>';
			$("#errors").html(errorContent);
		},
		removeErrorMessage: function(){
			$("#errors div").remove();
		},
		check: function(){
			this.model.set({done: !this.model.get('done')});
		}
	});

	App.Views.Tasks = Backbone.View.extend({
		tagName: 'ul',
		initialize: function(){
			App.vent.on('tasks-list', this.render, this);
			this.listenTo(this.collection, 'change', this.render);
			this.listenTo(this.collection, 'add', this.addOne);
			this.listenTo(this.collection, 'destroy', this.render);
		},
		render: function(){
			this.$el.html("");
			this.collection.each(this.addOne, this);
			this.$el.css({
				'paddingLeft': 0
			});
			this.saveToLocalStorage();
		},
		addOne: function(taskModel, taskIndex){
			if(typeof(taskIndex) == 'object')
				taskIndex = this.collection.length - 1; 
			var newTaskView = new App.Views.Task({ model:taskModel });
			this.$el.append(newTaskView.render(taskIndex+1).el);
			localStorage.setItem(App.config.localStorageName, JSON.stringify(this.collection.toJSON()));
		},
		saveToLocalStorage: function(){
			localStorage.setItem(App.config.localStorageName, JSON.stringify(this.collection.toJSON()));
		}
	});

	App.Views.AddTask = Backbone.View.extend({
		el: '#addTaskForm',

		initialize: function(){
			this.$el.css({
				'paddingBottom': 15
			});
		},

		events: {
			'submit': 'submit',
			'keydown input[type="text"]': 'removeErrorMessage'
		},
		submit: function(ev){
			ev.preventDefault();
			var input = this.$el.find('input[type="text"]'),
				newTaskName = input.val();

			if(!$.trim(newTaskName)){
				this.throwError('Enter a title for the task');
				input.focus();
				return;
			}
			else{
				this.removeErrorMessage();
			}

			if(newTaskName.length<4){
				this.throwError('Task title is too short. Min 4 characters.');
				input.focus();
				return;
			}else{
				var newTask = new App.Models.Task({
					title: newTaskName
				});
				this.collection.add(newTask);
				input.val('').focus();
			}
			
		},

		throwError: function(errorMsg){
			var errorContent = '<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">Error:</span>   '+errorMsg+'</div>';
			$("#errors").html(errorContent);
		},

		removeErrorMessage: function(){
			$("#errors div").remove();
		}
	});

	App.Views.TaskDetails = Backbone.View.extend({
		el: '#detailsModal',
		initialize: function(){
			App.vent.on('task-details:show', this.render, this);
			App.vent.on('task-details:hide', this.hideDetailsModal, this);
		},
		render: function(taskIndex){
			var $selector = this.$el;
			$selector.find(".modal-title").text(this.getTask(taskIndex).get('title'));
			$selector.find('.modal-body').text(this.getTask(taskIndex).get('description'));
			$selector.modal('show');
		},
		hideDetailsModal: function(){
			$(this.$el).modal('hide');
		},
		getTask: function(item){
			return this.collection.at(item-1);
		},
	});
	

	if(localStorage.getItem(App.config.localStorageName) === null || localStorage.getItem(App.config.localStorageName) === undefined){
		tasks = new App.Collections.Tasks([
			{
				title: 'Learn Backbone.js',
				priority: 2,
				description: "Learn Backbone.js and all necesary functionalities to create a real-world JS App."
			},
			{
				title: 'Add "Mark as done" functionality.',
				priority: 2,
				done: true
			},
			{
				title: 'Create first JS App',
				priority: 3,
				done: true
			},
			{
				title: 'Take a look at routes',
				priority: 5
			},
			{
				title: 'Validate forms in Backbone using a View',
				priority: 5
			}
		]);
	}else{
		tasksListFromLocalStorage = JSON.parse((localStorage.getItem(App.config.localStorageName)));
		tasks = new App.Collections.Tasks(tasksListFromLocalStorage);
	}

	// Router 
	new App.Router.Tasks();

	// Instancias de las vistas creadas
	var tasksView = new App.Views.Tasks({ collection: tasks });
	var newTaskView = new App.Views.AddTask({ collection: tasks });
	tasksView.render();
	new App.Views.TaskDetails({ collection: tasks });
	$(".myTasks").append(tasksView.el);

	Backbone.history.start();
	return App;
	
})();