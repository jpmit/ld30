var w4 = w4 || {};

w4.jukebox = new game.juke.Juke();
w4.jukebox.loadMusic({'main': 'sounds/song1'});
w4.jukebox.loadSfx({'complete': 'sounds/complete',
                 'jump': 'sounds/jump',
                 'spike': 'sounds/spike',
                 'switch': 'sounds/switch'
                });
w4.jukebox.playMusic('main');
