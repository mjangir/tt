<?php
$user = isset($_GET['user']) ? $_GET['user'] : 1;
?>
<!DOCTYPE html>
<html>
<head>
	<title></title>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.js"></script>
	<style type="text/css">
		.jackpot-param {
			font-size: 14px;
			color: #f00;
		}
	</style>
</head>
<body>

<div style="
    margin: auto;
    width: 350px;
    height: 500px;
    background: #EEE;
">
  <div style="
    float: left;
    width: 155px;
    padding: 10px;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #ccc;
    text-align: left;
" id="game-clock"></div>
    <div style="
    float: right;
    width: 155px;
    padding: 10px;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #ccc;
    text-align: right;
" id="doomsday-clock"></div>

<div style="
    padding: 2%;
    margin-top: 20px;
    border: 1px solid #ccc;
    clear: both;
    margin: 10px;
    float: left;
    width: 90%;
">
	<h4>Active Players: <span class="jackpot-param" id="active-players"></span></h4>
	<h4>Remaining Players: <span class="jackpot-param" id="remaining-players"></span></h4>
	<h4>Average Bid Bank: <span class="jackpot-param" id="average-bid-bank"></span></h4>
	<h4>Current Bid User: <span class="jackpot-param" id="current-bid-user"></span></h4>
	<h4>Current Bid Duration: <span class="jackpot-param" id="current-bid-duration"></span></h4>
    <h4>Longest Bid Duration: <span class="jackpot-param" id="longest-bid-duration"></span></h4>
	<h4>Total Bids: <span class="jackpot-param" id="total-bids"></span></h4>
	<h4>Total Users: <span class="jackpot-param" id="total-users"></span></h4>

</div>

<div style="
    padding: 2%;
    margin-top: 20px;
    clear: both;
    margin: 10px;
    float: left;
    width: 90%;
    text-align: center;
">
	<button id="place-bid">Place A Bid</button>

</div>


  </div>

  <input type="hidden" name="" id="jackpot_id">

<script type="text/javascript">
var socket;
	jQuery(document).ready(function()
	{
		socket = io.connect('ws://192.192.8.44:9000/jackpot', {
			path: '/ticktock/socket.io',
			query: {
				userId: <?php echo $user;?>
			}
		});

		socket.on('connect', function()
		{
			console.log("connected");

			socket.on('disconnect', function(data){
				console.log("disconnected");
			});

			socket.on('me_joined', function(data){
				jQuery('#jackpot_id').val(data.jackpotUniqueId);
			});

			// Update timer
			socket.on('update_jackpot_timer', function(data){
				jQuery('#game-clock').html(data.gameClockTime);
				jQuery('#doomsday-clock').html(data.doomsDayClockTime);
				jQuery('#current-bid-duration').html(data.lastBidDuration);
                 jQuery('#longest-bid-duration').html(data.longestBidDuration);

			});

			// Updated jackpot data
			socket.on('updated_jackpot_data', function(data)
			{
				if(data.activePlayers)
				{
                    console.log(data);
					jQuery('#active-players').html(data.activePlayers);
					jQuery('#remaining-players').html(data.remainingPlayers);
					jQuery('#average-bid-bank').html(data.averageBidBank);
					jQuery('#total-users').html(data.totalUsers);
					jQuery('#total-bids').html(data.totalBids);
					jQuery('#current-bid-user').html(data.currentBidUser.name);

					if(data.canIBid == true)
					{
						jQuery('#place-bid').show();
					}
				}
			});

			socket.on('can_i_bid', function(data)
			{
				if(data.canIBid == true)
				{
					jQuery('#place-bid').show();
				}
				else
				{
					jQuery('#place-bid').hide();
				}
			});

            // Game finished
            socket.on('game_finished', function(data){
                console.log(data);
            });

            // Show quit button
            socket.on('show_quit_button', function(data){
                console.log("show quit button");
            });
		})
	});

	jQuery(document).on('click', '#place-bid', function(e)
	{
		socket.emit('place_bid', {
			userId: <?php echo $user;?>,
			jackpotUniqueId: jQuery('#jackpot_id').val()
		})
	});
</script>
</body>
</html>