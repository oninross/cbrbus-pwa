        <script id="card-template" type="text/template">
            <div class="card" data-servicenum="{{! it.serviceNo }}">
                <div class="wrap">
                    <div class="col-3">
                        <p>{{! it.serviceNo }}</p>
                    </div>

                    <div class="status col-5">
                        {{? it.status == 'In Operation' }}
                        <p class="operational">{{! it.status }}</p>
                        {{??}}
                        <p class="non-operational">{{! it.status }}</p>
                        {{?}}
                    </div>

                    <div class="eta col-4">
                        {{? it.EstimatedArrival < 0 }}
                        <p class="departed">Departed</p>
                        {{?? it.EstimatedArrival == 0 }}
                        <p class="arriving">Arriving</p>
                        {{?? it.EstimatedArrival == 1 }}
                        <p class="near">{{! it.EstimatedArrival }} min</p>
                        {{??}}
                        <p>{{! it.EstimatedArrival }} mins</p>
                        {{?}}
                    </div>
                </div>
            </div>
        </script>

        <script id="toaster-template" type="text/template">
            <div class="toaster toaster{{= it.ind }}">
                <div class="container">
                    <p>{{! it.message }}</p>

                    <button class="js-dismiss">
                        <span class="vh">Close</span>
                        <i class="icon icon-cross"></i>
                    </button>
                </div>
            </div>
        </script>

        <!-- build:js //ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js -->
        <script src="/assets/btt/js/vendor/jquery-1.11.3.min.js"></script>
        <!-- /build -->

        <!--[if lt IE 9]>
            <script src="//cdnjs.cloudflare.com/ajax/libs/jquery-backstretch/2.0.4/jquery.backstretch.min.js"></script>
        <![endif]-->

        <!-- build:js /assets/btt/js/main.min.js -->
        <script src="/assets/btt/js/plugins.js"></script>
        <script src="/assets/btt/js/modules.js"></script>
        <script src="/assets/btt/js/main.js"></script>
        <!-- /build -->

        <!-- Google Analytics: change UA-XXXXX-X to be your site's ID. -->
        <script>
            (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
            function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
            e=o.createElement(i);r=o.getElementsByTagName(i)[0];
            e.src='https://www.google-analytics.com/analytics.js';
            r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
            ga('create','UA-XXXXX-X','auto');ga('send','pageview');
        </script>

    </body>
</html>