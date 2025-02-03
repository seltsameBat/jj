var timerFunction;

var imagePuzzle = {
    stepCount: 0,
    startTime: new Date().getTime(),
    startGame: function (images, gridSize) {
        this.setImage(images, gridSize);
        $('#playPanel').show();
        // Initialize Interact.js drag/drop for the pieces.
        this.enableSwapping();
        this.stepCount = 0;
        this.startTime = new Date().getTime();
        this.tick();
    },
    tick: function () {
        var now = new Date().getTime();
        var elapsedTime = parseInt((now - imagePuzzle.startTime) / 1000, 10);
        $('#timerPanel').text(elapsedTime);
        timerFunction = setTimeout(imagePuzzle.tick, 1000);
    },
    enableSwapping: function () {
        // Use Interact.js for draggable pieces.
        interact('#sortable li')
          .draggable({
              inertia: true,
              modifiers: [
                  interact.modifiers.restrictRect({
                      restriction: 'parent',
                      endOnly: true
                  })
              ],
              autoScroll: true,
              listeners: {
                  move: dragMoveListener,
                  end: function (event) {
                      // On drag end, check if this element was dropped over another.
                      // We use a temporary attribute (data-drop-target) set on dragenter.
                      var target = event.target;
                      var dropTargetSelector = target.getAttribute('data-drop-target');
                      if (dropTargetSelector) {
                          var dropElem = document.querySelector(dropTargetSelector);
                          swapElements(target, dropElem);
                      }
                      // Reset transform and data attributes.
                      target.style.transform = 'none';
                      target.removeAttribute('data-x');
                      target.removeAttribute('data-y');
                      target.removeAttribute('data-drop-target');
                  }
              }
          })
          .dropzone({
              // Accept drops from any other piece.
              accept: '#sortable li',
              overlap: 0.5,
              listeners: {
                  dragenter: function (event) {
                      // When a draggable enters a dropzone, mark it.
                      event.target.classList.add('drop-target');
                      // Mark the dragged element with the drop target’s selector.
                      event.relatedTarget.setAttribute('data-drop-target', '#' + event.target.id);
                  },
                  dragleave: function (event) {
                      event.target.classList.remove('drop-target');
                      event.relatedTarget.removeAttribute('data-drop-target');
                  },
                  drop: function (event) {
                      event.target.classList.remove('drop-target');
                  },
                  dropdeactivate: function (event) {
                      event.target.classList.remove('drop-active');
                      event.target.classList.remove('drop-target');
                  }
              }
          });
    },
    setImage: function (images, gridSize) {
        // Use the actual width of #sortable instead of a fixed value.
        var containerWidth = $('#sortable').width() || 400;
        var percentage = 100 / (gridSize - 1);
        var image = images[Math.floor(Math.random() * images.length)];
        $('#imgTitle').html(image.title);
        $('#actualImage').attr('src', image.src);
        $('#sortable').empty();
        for (var i = 0; i < gridSize * gridSize; i++) {
        var xpos = (percentage * (i % gridSize)) + '%';
        var ypos = (percentage * Math.floor(i / gridSize)) + '%';
        // Assign an id (piece_i) to each puzzle piece.
        var li = $('<li class="item" id="piece_' + i + '" data-value="' + i + '"></li>').css({
        'background-image': 'url(' + image.src + ')',
        'background-size': (gridSize * 100) + '%',
        'background-position': xpos + ' ' + ypos,
        'width': containerWidth / gridSize,
        'height': containerWidth / gridSize
        });
        $('#sortable').append(li);
        }
        // Optionally randomize the pieces.
        $('#sortable').randomize();
        }
};

function dragMoveListener(event) {
    var target = event.target;
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

function swapElements(elem1, elem2) {
    if (!elem1 || !elem2 || elem1 === elem2) return;
    var parent = elem1.parentNode;
    // Swap positions in the DOM.
    var placeholder = document.createElement('div');
    parent.insertBefore(placeholder, elem1);
    parent.insertBefore(elem1, elem2);
    parent.insertBefore(elem2, placeholder);
    parent.removeChild(placeholder);

    // Reset transforms.
    $(elem1).css({transform:'none'}).attr('data-x', 0).attr('data-y', 0);
    $(elem2).css({transform:'none'}).attr('data-x', 0).attr('data-y', 0);

    // Update step count and check if the puzzle is solved.
    var currentList = $('#sortable > li').map(function (i, el) { return $(el).attr('data-value'); }).get();
    if (isSorted(currentList)) {
        $('#actualImageBox').empty().html($('#gameOver').html());
        clearTimeout(timerFunction);
    } else {
        imagePuzzle.stepCount++;
        $('.stepCount').text(imagePuzzle.stepCount);
        var now = new Date().getTime();
        $('.timeCount').text(parseInt((now - imagePuzzle.startTime) / 1000, 10));
    }
}

function isSorted(arr) {
    for (var i = 0; i < arr.length - 1; i++) {
        if (arr[i] != i)
            return false;
    }
    return true;
}

$.fn.randomize = function (selector) {
    var $elems = selector ? $(this).find(selector) : $(this).children(),
        $parents = $elems.parent();

    $parents.each(function () {
        $(this).children(selector).sort(function () {
            return Math.round(Math.random()) - 0.5;
        }).remove().appendTo(this);
    });
    return this;
};
