<?php
    set_include_path($_SERVER['DOCUMENT_ROOT'] . '/includes');
    $primary = 0;
    include('header.php');
?>

<main id="main">
	<section class="container timetable">
        <div class="wrap">
            <div class="loader">
                <svg class="circular" viewBox="25 25 50 50">
                    <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/>
                </svg>
            </div>

            <div class="col-12">
            </div>
        </div>
	</section>
</main>

<?php include('footer.php'); ?>

