$(function(){

    function ActivtyPage(activities){
        var self = this;

        self.month = ko.observable();
        self.year = ko.observable();
        self.user = ko.observable();

        self.activities = ko.observableArray(activities);

        this.reload = function(){
            $.getJSON('/user_activities/'+ self.user() + '/' + self.year() + '/' + self.month(), function (result){
                self.activities.removeAll();
                $.each(result, function(index, item){
                    self.activities.push(new ActivityVM(item.id, item.type, item.date, item.hours, item.description, item.jobOrder, item.activity));
                });
            });

            // $.getJSON('/user_activities/stats/'+ user + '/' + year + '/' + month, function (response){
            //     var stats = new StatsViewModel(response.today_hours, response.yesterday_hours);
            //     ko.applyBindings(stats, $('#stats')[0]);
            // });
        };

    }

    function NewActivityVM(){
        var self = this;

        self.jobOrders = ko.observableArray();
        self.jobOrderActivities = ko.observableArray();
        self.activityTypes = ko.observableArray();

        self.type = ko.observable();
        self.date = ko.observable();
        self.hours = ko.observable();
        self.description = ko.observable();
        self.jobOrder = ko.observable();
        self.activity = ko.observable();

        self.jobOrder.subscribe(function(newValue) {
             self.loadJobOrderActivities(newValue);
        });

        self.save = function(){
            var data = { type: self.type, date:self.date, hours:self.hours, description: self.description, jobOrder: self.jobOrder, activity: self.activity };
            $.post('/user_activities', data, function (data){  
                var result = $.parseJSON(data);
                newActivity = new ActivityVM(result.id, result.type, result.date, result.hours, result.description, result.jobOrder, result.activity);
                self.activities.push(newActivity);
               
                self.hours('');
                self.description('');    
                $('#newActivity').addClass('hide');
            });
        }

        self.loadJobOrderActivities = function(jobOrderId){
            $.getJSON('/job_orders/' + jobOrderId + '/job_order_activities', function(data){
                self.jobOrderActivities(data);
            });
        }

        self.init = function(){
            $.getJSON('/job_orders', function(data){
                self.jobOrders(data);
                self.loadJobOrderActivities(self.jobOrder());
            });


            $.getJSON('/user_activity_types', function(data){
                self.activityTypes(data);
            });

        }

    }


    function ActivityVM(id, type, date, hours, description, jobOrder, activity)
    {
        var self = this;

        this.id = ko.observable(id);
        this.type = ko.observable(type);
        this.date = ko.observable(date);
        this.hours = ko.observable(hours);
        this.description = ko.observable(description);
        this.jobOrder = ko.observable(jobOrder);
        this.activity = ko.observable(activity);
        this.activityJobOrder  = ko.computed(function() {
            return this.activity() + ' (' + this.jobOrder() + ')'
        }, this);
        this.isVisible = ko.observable(true);

        self.removeActivity = function(){
            if (window.confirm('cancellare?')){
                $.ajax({
                        type: 'DELETE',
                        url: 'user_activities/' + self.id(),
                        success: function(){
                             self.isVisible(false);
                        }
                });
            }
        };
    }   

    function StatsViewModel(today, yesterday){
        this.today_hours = ko.observable(today);
        this.yesterday_hours = ko.observable(yesterday);
    }

    var month = $('#date_month').val();
    var year = $('#date_year').val();
    var user = $('#user').val();

    if (month !== undefined && year !== undefined && user !== undefined){

        var activityList = new ActivtyPage([]);
        
        $.getJSON('/user_activities/'+ user + '/' + year + '/' + month, function (result){
            var current = [];
            $.each(result, function(index, item){
                current.push(new ActivityVM(item.id, item.type, item.date, item.hours, item.description, item.jobOrder, item.activity));
            });
            activityList.activities(current);
        });

        ko.applyBindings(activityList, $('#activityPage')[0]);

        // fill the modal popup
        var activity = new NewActivityVM();
        activity.init();
        ko.applyBindings(activity, $('#newActivity')[0]);

        // $.getJSON('/user_activities/stats/'+ user + '/' + year + '/' + month, function (response){
        //     var stats = new StatsViewModel(response.today_hours, response.yesterday_hours);
        //     ko.applyBindings(stats, $('#stats')[0]);
        // });

      
    }

    // ko.extenders.logChange = function(target, option) {
    // target.subscribe(function(newValue) {
    //    console.log(option + ": " + newValue);
    // });
    //return target;
    //};
});
