<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:janes="http://dtd.janes.com/2002/Content/"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:jm="http://dtd.janes.com/2005/metadata/"
                exclude-result-prefixes = "janes dc xlink jm">
  <xsl:output encoding="UTF-8" indent="yes" method="html" omit-xml-declaration="yes" />
  <xsl:variable name="portID" select="/mlInformation/metadata[1]/details[1]/Port_ID[1]"/>

  <xsl:template match="/mlInformation/metadata/berths[1]">
    <div class="grid-container" style="margin-top:5px;">
      <div class="grid">
        <div class="grid-1-1">
          <div class="panel panel-default">
            <div class="panel-heading">
              Associated Berths
            </div>
            <div class="panel-body">
              <xsl:apply-templates mode="berth"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="berths">
    <xsl:apply-templates/>
   </xsl:template>

  <xsl:template match="//berth" mode="berth">
    <xsl:param name="lat" select="lat"/>
    <xsl:param name="lon" select="lon"/>
    <div>
      <a class="h4" style="font-weight:bold;" target="blank">
        <xsl:attribute name="href">
          <xsl:value-of select="concat('/MaritimePorts/Display/Port_', $portID, '#', name)" />
        </xsl:attribute>
        <xsl:attribute name="name">
          <xsl:value-of select="name"/>
        </xsl:attribute>
        <xsl:value-of select="name"/>
      </a>
      <p class="para"></p>
      <div class="table-responsive">
        <table class="table table-bordered  table-hover table-condensed">
          <tr>
            <th>ID</th>
            <td>
              <xsl:value-of select="id"/>
            </td>
          </tr>
          <tr>
            <th>Name</th>
            <td>
              <xsl:value-of select="name"/>
            </td>
          </tr>
          <tr>
            <th>Facility Type</th>
            <td>
              <xsl:value-of select="facility_type"/>
            </td>
          </tr>
          <tr>
            <th>Terminal</th>
            <td>
              <xsl:value-of select="terminal_name"/>
            </td>
          </tr>
          <tr>
            <th>Coords</th>
            <td>
              <xsl:choose>
                <xsl:when test="$lat = 0 or $lon = 0">
                  Unknown
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="concat(lat, ' ', lon)"/>
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="section|subsection|title|details|facilities|title|postdate|subject|country|berth|table">
  </xsl:template>
 

  <!--<xsl:template match="name">
    <div class="panel-heading">
      <xsl:value-of select="."/>
    </div>
  </xsl:template>-->
</xsl:stylesheet>
