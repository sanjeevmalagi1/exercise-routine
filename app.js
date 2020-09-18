var EXERCISE_DATA = {};
var time_coefficient = 1000;

var applicationState = {
  currentWorkout: 0,
  currentExercise: 0,
  currentState: "idle",
  currentTime: 0,
  listener: function(){},
  setState: function(newState) {
    for (const key in newState) {
      this[key] = newState[key];
    }
    this.listener();
  },
  registerListener: function(listener) {
    this.listener = listener;
  }
};


function render() {
  var currentWorkout = EXERCISE_DATA[applicationState.currentWorkout].workout;
  var currentExercise = currentWorkout[applicationState.currentExercise];

  var time = applicationState.currentTime ? applicationState.currentTime : currentExercise.duration;
  var exercise  = currentExercise.name ? currentExercise.type + ' : ' + currentExercise.name : currentExercise.type
  $('#exercise').text(exercise);
  $('#timer').text(time);
}

function tickDown(totalTimeInSeconds, onComplete) {
  applicationState.setState({
    currentTime: totalTimeInSeconds,
  });
  
  var interval = setInterval(function () {
    applicationState.setState({
      currentTime: applicationState.currentTime - 1,
    });
  }, time_coefficient);
  
  setTimeout(function() {
    clearInterval(interval);
    onComplete();
  }, totalTimeInSeconds * time_coefficient);
}

function handleResponse(data, status) {
  if(status != 'success') {
    return;
  }
  EXERCISE_DATA = data;
  render();
}

function handleOnComplete() {
  var currentWorkout = EXERCISE_DATA[applicationState.currentWorkout].workout;

  if (applicationState.currentExercise < (currentWorkout.length - 1) ) {
    applicationState.setState({
      currentState: 'idle',
      currentExercise: applicationState.currentExercise + 1,
    });
    return;
  }

  if (applicationState.currentWorkout < (EXERCISE_DATA.length - 1) ) {
    applicationState.setState({
      currentState: 'idle',
      currentWorkout: applicationState.currentWorkout + 1,
      currentExercise: 0
    });
    return;
  }

  applicationState.setState({
    currentState: 'completed',
  });
}

function startButtonClickHandler(e) {
  if (applicationState.currentState == 'busy') {
    return;
  }
  
  var currentWorkout = EXERCISE_DATA[applicationState.currentWorkout].workout;
  var currentExercise = currentWorkout[applicationState.currentExercise];

  applicationState.setState({ currentState: 'busy' });
  tickDown(currentExercise.duration, handleOnComplete);
}

$(document).ready(function() {
  $.get("data.json", handleResponse);
  $('#start').click(startButtonClickHandler);

  applicationState.registerListener(function() {
    render();
  })
});