Six Degrees of GitHub
=====================
This project was created for the [2014 GitHub Data Challenge][ghdc].  The goal
of the project is to take two users and determine how closely related they are
within GitHub's social environment.

The project is available online at http://six-degrees.kevinbrown.in/.

How it works
============
All of the data used is taken from the latest [GHTorrent][ghtorrent] data dump.
The latest data dump was taken on March 29th and consisted of 6 GB of compressed
SQL dumps (25GB uncompressed) in MySQL format.

Getting the data
----------------
The SQL dumps provided by GHTorrent were converted over to SQLite data dumps and
imported into SQLite databases for portability.  From there, individual parts
were converted in a JSON formatted set of data files that could be used on the
front end when determining the number of steps required.

[ghdc]: https://github.com/blog/1864-third-annual-github-data-challenge
[ghtorrent]: http://ghtorrent.org/
[six-degrees]: http://kevinbrown.in/six-degrees
