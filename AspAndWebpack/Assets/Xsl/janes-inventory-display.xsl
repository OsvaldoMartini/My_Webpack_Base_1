<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output encoding="UTF-8" indent="yes" method="html" omit-xml-declaration="yes" />

  <xsl:variable name="content" select="inventory"/>
  <xsl:variable name="genericRoles" select="$content/genericRoles"/>
  <xsl:variable name="manufacturers" select="$content/manufacturers"/>
  <xsl:variable name="roles" select="$content/roles"/>
  <xsl:variable name="equipment" select="$content/equipment"/>
  <xsl:variable name="updatedDate" select="$content/updatedDate"/>
  <xsl:variable name="year" select="substring(updatedDate, 1, 4)" />
  <xsl:variable name="day" select="substring(updatedDate, 7, 2)" />
  <xsl:variable name="month">
    <xsl:call-template name="numbertoThreeLetterName">
      <xsl:with-param name="monthNum">
        <xsl:value-of select="substring(updatedDate, 5, 2)" />
      </xsl:with-param>
    </xsl:call-template>
  </xsl:variable>
  <xsl:variable name="systemName" select="$content/systemName" />
  <xsl:variable  name="country" select="$content/operatorCountry"/>
  <xsl:variable name="operatorForce" select="$content/operatorForce"/>

  <xsl:template match="/">
    <h1 class="page-header u-margin-Bm u-margin-Ts u-padding-Bs">
      <xsl:value-of select="concat($systemName, ' - ', $country, ' - ', $operatorForce)"/>
    </h1>

    <!--<div class="pull-left u-margin-Rl width-20 hidden-print">
      <div class="panel panel-default">
        <div class="panel-heading">Port Details</div>
        <div class="panel-body">
          <xsl:call-template name="recordDetails">
            <xsl:with-param name="details" select="$details"/>
          </xsl:call-template>
        </div>
      </div>
    </div>-->

    <!-- content -->
    <div id="mainContent">
      <div>
        <table class="table table-bordered table-striped">
          <tbody>
            <tr>
              <th>System</th>
              <td>
                <xsl:value-of select="$systemName"/>
              </td>
            </tr>
            <tr>
              <th>Entry Into Service</th>
              <td>
                <xsl:value-of select="$content/yearOfInitialDelivery"/>
              </td>
            </tr>
            <tr>
              <th>Family</th>
              <td>
                <xsl:value-of select="$content/familyName"/>
              </td>
            </tr>
            <tr>
              <th>Status</th>
              <td>
                <xsl:value-of select="$content/acquiredOrInService"/>
              </td>
            </tr>
            <tr>
              <th>Operator Country</th>
              <td>
                <xsl:value-of select="$content/operatorCountry"/>
              </td>
            </tr>
            <tr>
              <th>Operator Force</th>
              <td>
                <xsl:value-of select="$content/operatorForce"/>
              </td>
            </tr>
            <tr>
              <th>Operator Name</th>
              <td>
                <xsl:value-of select="$content/operatorName"/>
              </td>
            </tr>
            <tr>
              <th>Type</th>
              <td>
                <xsl:value-of select="$content/type"/>
              </td>
            </tr>
            <tr>
              <th>Year Of Initial Delivery</th>
              <td>
                <xsl:value-of select="$content/yearOfInitialDelivery"/>
              </td>
            </tr>
            <tr>
              <th>Number Ordered</th>
              <td>
                <xsl:value-of select="$content/totalOrderedAll"/>
              </td>
            </tr>
            <tr>
              <th>Number Delivered</th>
              <td>
                <xsl:value-of select="$content/totalDeliveredAll"/>
              </td>
            </tr>
            <tr>
              <th>Number In Service</th>
              <td>
                <xsl:value-of select="$content/inService"/>
              </td>
            </tr>
            <tr>
              <th>Generic Roles</th>
              <td>
                <xsl:apply-templates select="$content/genericRoles/role"/>
              </td>
            </tr>
            <tr>
              <th>Roles</th>
              <td>
                <xsl:apply-templates select="$content/roles/role"/>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </xsl:template>


  <xsl:template match="role">
    <xsl:value-of select="concat(.,' ')"/>
  </xsl:template>

  <xsl:template name="sections">
    <xsl:param name="section"/>
    <h2>
      <xsl:value-of select="title" disable-output-escaping="yes"/>
    </h2>
    <xsl:for-each select="subsection">
      <xsl:call-template name="subsections">
        <xsl:with-param name="subsection" select="subsection"/>
      </xsl:call-template>
    </xsl:for-each>
  </xsl:template>

  <xsl:template name="subsections">
    <xsl:param name="subsection"/>
    <h3>
    </h3>
  </xsl:template>

  <xsl:template name="recordDetails">
    <xsl:param name="details"/>
    <p class="u-bold u-padding-Txxs u-margin-Bxxs">Status</p>
    <p>
      <xsl:value-of select="$details/Status"/>
    </p>
    <p class="u-bold u-padding-Txxs u-margin-Bxxs">UNLCode</p>
    <p>
      <xsl:value-of select="$details/UNCTAD_Code"/>
    </p>
    <p class="u-bold u-padding-Txxs u-margin-Bxxs">Compliance</p>
    <xsl:if test="$details/ISPS_Compliant = 'true'">
      <p>ISPS</p>
    </xsl:if>
    <xsl:if test="$details/CSI_Compliant = 'true'">
      <p>CSI</p>
    </xsl:if>
    <xsl:if test="$details/CSI_Compliant = 'true' and $details/ISPS_Compliant = 'true'">
      <p>None</p>
    </xsl:if>
  </xsl:template>

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
