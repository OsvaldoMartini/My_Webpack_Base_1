<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:janes="http://dtd.janes.com/2002/Content/">

  <xsl:output omit-xml-declaration="yes" />

  <xsl:param name="stringLookups">
    <root>
      <string language="en" key="displayName">Unit name</string>
      <string language="en" key="name">Base</string>
      <string language="en" key="primaryParent">Parent unit name</string>
      <string language="en" key="associatedEquipments">Equipment</string>
      <string language="en" key="echelon">Echelon</string>
      <string language="en" key="type">Type</string>
      <string language="en" key="branch">Branch</string>
      <string language="en" key="unitType">Unit Type</string>
      <string language="en" key="unitRole">Unit Role</string>
    </root>
  </xsl:param>
  
  <xsl:template match="/">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="mlEnvelope">
    <xsl:element name="table">
      <xsl:attribute name="class">table</xsl:attribute>
      <xsl:element name="tbody">
        <xsl:apply-templates select="content"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="content|orbat|Orbat">
    <xsl:choose>
      <xsl:when test="orbat|Orbat">
        <xsl:apply-templates/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates select="installation/name"/>
        <xsl:apply-templates select="displayName"/>
        <xsl:apply-templates select="primaryParent"/>
        <xsl:apply-templates select="associatedEquipments"/>
        <xsl:apply-templates select="echelon"/>
        <xsl:apply-templates select="branch"/>
        <xsl:apply-templates select="unitType"/>
        <xsl:apply-templates select="unitRole"/>        
      </xsl:otherwise>
    </xsl:choose> 
  </xsl:template>

  <xsl:template match="content/*[not(local-name() = 'orbat')][not(local-name() = 'Orbat')]|orbat/*|Orbat/*|orbat/installation/name">
    <xsl:element name="tr">
      <xsl:call-template name="table_label">
        <xsl:with-param name="text" select="local-name()"/>
      </xsl:call-template>
      <xsl:element name="td">
        <xsl:apply-templates/>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="associatedEquipment">
    <xsl:element name="div">
      <xsl:attribute name="class">
        <xsl:text>u-margin-Bxxs</xsl:text>
      </xsl:attribute>
      <xsl:element name="a">
        <xsl:attribute name="target">_blank</xsl:attribute>
        <xsl:attribute name="href">
          <xsl:text>/equipment/explore/</xsl:text>
          <xsl:value-of select="equipmentId"/>
        </xsl:attribute>
          <xsl:value-of select="equipmentName"/>
      </xsl:element>
      <xsl:element name="span">
        <xsl:attribute name="class">
          <xsl:text>badge u-margin-Hxxs</xsl:text>
        </xsl:attribute>
        <xsl:apply-templates select="numberOfItems" />
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="associatedEquipments/associatedEquipment/*">
    <xsl:apply-templates/>
  </xsl:template>  
  
  <!-- NAMED TEMPLATES -->
  <xsl:template name="table_label">
    <xsl:param name="text" />
    <xsl:element name="td">
      <xsl:choose>
        <xsl:when test="$stringLookups/root/string[@key=$text and @language='en']">
          <xsl:value-of select="$stringLookups/root/string[@key=$text and @language='en']"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$text"/>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:text>:&#160;</xsl:text>
    </xsl:element>
  </xsl:template>

</xsl:stylesheet>

