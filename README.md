Six Degrees of GitHub
=====================
This project was created for the [2014 GitHub Data Challenge][ghdc].  The goal
of the project is to take two users and determine how closely related they are
within GitHub's social environment.

The project is available online at http://six-degrees.kevinbrown.in/.

How it works
============
All of the data used is taken from the latest [GHTorrent][ghtorrent] data dump.
The latest data dump was taken around August 16th and consisted of 11 GB of
compressed SQL dumps (41GB uncompressed) in a MySQL dump format.

You can find more information on how to retrieve and convert these database
dumps in the [updating guide][updating].

Keeping it static
-----------------
The goal of this project was to allow any two users to find how many steps it
took to connect them, without restricting where the scripts were located or who
they could be used by.

This meant keeping it 100% static, so the mirrors which hosted the data would
not have to have anything except for a static file server.  This was done by
compressing all of the relevant data into the JSON format, so it could be read
by any program which could interpret it.

It also meant making it accessible through a web browser, so users were not
limited to specific operating systems or device types.  This allows the
Six Degrees project to be accessed even on mobile devices, while still providing
the user a rich experience.

Compressing the followers
-------------------------
The follower data was compressed into a JSON format for any users in the MySQL
dump which either followed other users or were followed by users.  Any users
which have no followers in either direction were not included in the output, and
missing files are assumed to be for users who can be ignored.

In order to keep bandwidth costs low, any data which did not need to be
referenced was not included in the compressed JSON files.  This allowed us to
compress the data for 750 thousand users into less than 500 MB while still
keeping the files readable by any program that used them.

Connecting users
----------------
When connecting two users through their followers, a [bidirectional search][bd]
is used as it is relatively fast for the most common cases.  Because of this,
using the same two users for the start and finish can result in different paths
when reversed, as the search is strictly in one direction.

Multiple checks are in place to ensure that the same paths are not checked
multiple times, so the shortest path from one user to another can be found while
still searching efficiently.

Licenses
========
The code backing the Six Degrees of GitHub website is
[licensed under the MIT license][sdgh-license].  This does not include the data
being used, which is taken from GHTorrent and is not hosted within the
repositories.  `convert.py`, which is used to convert MySQL data dumps into
SQLite data dumps, is [licensed under the MIT license][convert.py-license].

The Six Degrees of GitHub website uses [Bootstrap][bootstrap-license] and a
[Bootswatch theme][bootswatch-license], which are both licensed under the MIT
license.  [Font Awesome][fontawesome-license], which is the icon font used as a
scalable replacement for icon images, is licensed under the MIT license and the
SIL Open Font License.

[bd]: https://en.wikipedia.org/wiki/Bidirectional_search
[ghdc]: https://github.com/blog/1864-third-annual-github-data-challenge
[ghtorrent]: http://ghtorrent.org/
[six-degrees]: http://six-degrees.kevinbrown.in/
[updating]: UPDATING.md

[bootstrap-license]: https://github.com/twbs/bootstrap/blob/0140198699a41d299cd2d100e01c12c967b765e4/LICENSE
[bootswatch-license]: https://github.com/thomaspark/bootswatch/blob/80737eebb10731383dd61f9c5e50951667434cc8/LICENSE
[convert.py-license]: https://gist.github.com/kevin-brown/d5fd25cd67e42a0d6261#file-license-md
[fontawesome-license]: http://fontawesome.io/license/
[sdgh-license]: LICENSE.md
