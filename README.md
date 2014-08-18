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

You can find more information on how to retrieve and convert these database
dumps in the [updating guide][updating].

[ghdc]: https://github.com/blog/1864-third-annual-github-data-challenge
[ghtorrent]: http://ghtorrent.org/
[six-degrees]: http://six-degrees.kevinbrown.in/
[updating]: UPDATING.md
