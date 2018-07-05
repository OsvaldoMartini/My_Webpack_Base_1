<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
								xmlns:xlink="http://www.w3.org/1999/xlink"
								exclude-result-prefixes = "xlink">

	<xsl:output encoding="UTF-8" indent="yes" method="html" omit-xml-declaration="yes" />

	<!--Matching template-->
	<xsl:template match="/">
		<xsl:apply-templates select="//video" />
	</xsl:template>

	<xsl:template match="video">
		<xsl:variable name="creationDate" select="creationDate" />
		<xsl:variable name="creationyear" select="substring($creationDate, 1, 4)" />
		<xsl:variable name="creationday" select="substring($creationDate, 9, 2)" />
		<xsl:variable name="creationmonth">
			<xsl:call-template name="numbertoThreeLetterName">
				<xsl:with-param name="monthNum">
					<xsl:value-of select="substring($creationDate, 6, 2)" />
				</xsl:with-param>
			</xsl:call-template>
		</xsl:variable>

		<xsl:variable name="updateDate" select="updateDate" />
		<xsl:variable name="updateyear" select="substring($updateDate, 1, 4)" />
		<xsl:variable name="updateday" select="substring($updateDate, 9, 2)" />
		<xsl:variable name="updatemonth">
			<xsl:call-template name="numbertoThreeLetterName">
				<xsl:with-param name="monthNum">
					<xsl:value-of select="substring($updateDate, 6, 2)" />
				</xsl:with-param>
			</xsl:call-template>
		</xsl:variable>

		<!-- No need header here, as it is handled in the display page -->
		<!--<h1 class="page-header u-margin-Bm u-margin-Ts u-padding-Bs">
			<xsl:apply-templates select="title" />
		</h1>-->
		<div class="visible-print">
			<p>
				<b>Date Posted:&#160;</b>
				<xsl:value-of select="concat($updateday, '-', $updatemonth, '-', $updateyear)" />
			</p>
			<p>
				<b>Publication:&#160;</b>
				Online Video
			</p>
		</div>
		<div class="pull-left width-20 hidden-print">
			<div class="panel panel-default">
				<div class="panel-heading">Record Info</div>
				<div class="panel-body">
					<p class="u-bold u-padding-Txxs u-margin-Bxxs">Publication</p>
					<p>
						Online Video
						<p class="u-bold u-padding-Txxs u-margin-Bxxs">Date posted</p>
						<p>
							<xsl:value-of select="concat($updateday, '-', $updatemonth, '-', $updateyear)" />
						</p>
					</p>
				</div>
			</div>
		</div>
		<div class="pull-right" style="width: 79%">
			<div id="mainContent">
				<iframe id="vidContainer"
								name="vidContainer"
								title="video player"
								type="text/html"
								style=" width: 100%; height: 50vh;"
								frameborder="0"
								allowFullScreen=""
								allowTransparency="true"
								mozallowfullscreen=""
								webkitAllowFullScreen="">

					<xsl:attribute name="src">
						<xsl:value-of select="videoUrl" />
					</xsl:attribute>
				</iframe>

				<p id="vidDescription" class="u-margin-Vs">
					<xsl:apply-templates select="description" />
				</p>
			</div>
		</div>
		</xsl:template>

	<xsl:template match="*">
			<xsl:apply-templates />
		</xsl:template>

	<!--Naming template-->
	<xsl:template name="numbertoThreeLetterName">
			<xsl:param name="monthNum" />
			<xsl:choose>
				<xsl:when test="$monthNum = '1' or $monthNum = '01'">
					<xsl:text>Jan</xsl:text>
				</xsl:when>
				<xsl:when test="$monthNum = '2' or $monthNum = '02'">
					<xsl:text>Feb</xsl:text>
				</xsl:when>
				<xsl:when test="$monthNum = '3' or $monthNum = '03'">
					<xsl:text>Mar</xsl:text>
				</xsl:when>
				<xsl:when test="$monthNum = '4' or $monthNum = '04'">
					<xsl:text>Apr</xsl:text>
				</xsl:when>
				<xsl:when test="$monthNum = '5' or $monthNum = '05'">
					<xsl:text>May</xsl:text>
				</xsl:when>
				<xsl:when test="$monthNum = '6' or $monthNum = '06'">
					<xsl:text>Jun</xsl:text>
				</xsl:when>
				<xsl:when test="$monthNum = '7' or $monthNum = '07'">
					<xsl:text>Jul</xsl:text>
				</xsl:when>
				<xsl:when test="$monthNum = '8' or $monthNum = '08'">
					<xsl:text>Aug</xsl:text>
				</xsl:when>
				<xsl:when test="$monthNum = '9' or $monthNum = '09'">
					<xsl:text>Sep</xsl:text>
				</xsl:when>
				<xsl:when test="$monthNum = '10'">
					<xsl:text>Oct</xsl:text>
				</xsl:when>
				<xsl:when test="$monthNum = '11'">
					<xsl:text>Nov</xsl:text>
				</xsl:when>
				<xsl:when test="$monthNum = '12'">
					<xsl:text>Dec</xsl:text>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="$monthNum"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:template>
</xsl:stylesheet>